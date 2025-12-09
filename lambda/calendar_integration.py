"""
Calendar integration for Sahil's portfolio chatbot.
Simple approach: Store bookings in DynamoDB + send email via SES.

No external calendar API needed - instant deployment!
"""

import os
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import pytz
import boto3

# Sahil's email and availability  
SAHIL_EMAIL = "experiments.datas@gmail.com"
TIMEZONE = 'Asia/Singapore'

# Define Sahil's weekly availability (Singapore time)
AVAILABILITY = {
    'Monday': [
        {'start': '14:00', 'end': '17:00'}  # 2 PM - 5 PM
    ],
    'Tuesday': [
        {'start': '11:00', 'end': '12:30'},  # 11 AM - 12:30 PM
        {'start': '15:00', 'end': '17:00'}   # 3 PM - 5 PM
    ],
    'Friday': [
        {'start': '14:00', 'end': '17:00'}  # 2 PM - 5 PM
    ]
}


def get_dynamodb():
    """Get DynamoDB resource for storing bookings."""
    return boto3.resource('dynamodb')


def get_ses_client():
    """Get AWS SES client for sending emails."""
    return boto3.client('ses', region_name='us-east-1')


def get_available_slots(days_ahead: int = 14) -> List[Dict]:
    """
    Get available meeting slots for the next N days.
    Checks DynamoDB for existing bookings.
    
    Args:
        days_ahead: Number of days to look ahead (default 14)
    
    Returns:
        List of dicts with slot details
    """
    try:
        singapore_tz = pytz.timezone(TIMEZONE)
        now = datetime.now(singapore_tz)
        
        available_slots = []
        booked_slots = get_booked_slots()
        
        # Check each day for the next N days
        for day_offset in range(days_ahead):
            check_date = now + timedelta(days=day_offset)
            day_name = check_date.strftime('%A')
            
            # Skip if this day is not in availability
            if day_name not in AVAILABILITY:
                continue
            
            # Check each availability window for this day
            for window in AVAILABILITY[day_name]:
                # Parse start and end times
                start_time = datetime.strptime(window['start'], '%H:%M').time()
                end_time = datetime.strptime(window['end'], '%H:%M').time()
                
                # Create datetime objects for this window
                current_slot = singapore_tz.localize(
                    datetime.combine(check_date.date(), start_time)
                )
                window_end = singapore_tz.localize(
                    datetime.combine(check_date.date(), end_time)
                )
                
                # Generate 30-minute slots within this window
                while current_slot + timedelta(minutes=30) <= window_end:
                    # Skip past slots and booked slots
                    slot_key = current_slot.isoformat()
                    if current_slot > now and slot_key not in booked_slots:
                        available_slots.append({
                            'datetime': current_slot,
                            'formatted_time': current_slot.strftime('%A, %B %d at %I:%M %p SGT'),
                            'slot_key': slot_key
                        })
                    
                    current_slot += timedelta(minutes=30)
                    
                    # Limit to 10 slots
                    if len(available_slots) >= 10:
                        return available_slots
        
        return available_slots
    
    except Exception as e:
        print(f"Error getting available slots: {str(e)}")
        return []


def get_booked_slots() -> set:
    """Get all confirmed booking slots from DynamoDB."""
    try:
        dynamodb = get_dynamodb()
        table = dynamodb.Table('sahil-portfolio-bookings')
        
        response = table.scan(
            FilterExpression='#status = :confirmed',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':confirmed': 'confirmed'}
        )
        
        booked = set()
        for item in response.get('Items', []):
            booked.add(item['slot_datetime'])
        
        return booked
    
    except dynamodb.meta.client.exceptions.ResourceNotFoundException:
        # Table doesn't exist yet - will be created on first booking
        print("Bookings table doesn't exist yet, returning empty set")
        return set()
    except Exception as e:
        print(f"Error getting booked slots: {str(e)}")
        return set()


def create_booking(user_email: str, slot_datetime: datetime, user_name: Optional[str] = None) -> Dict:
    """
    Create a booking in DynamoDB and send email confirmations.
    
    Args:
        user_email: Email of the person booking
        slot_datetime: Datetime for the meeting
        user_name: Optional name
    
    Returns:
        Dict with booking result
    """
    try:
        dynamodb = get_dynamodb()
        
        # Create table if it doesn't exist
        try:
            table = dynamodb.Table('sahil-portfolio-bookings')
            table.load()  # Check if exists
        except:
            table = dynamodb.create_table(
                TableName='sahil-portfolio-bookings',
                KeySchema=[
                    {'AttributeName': 'booking_id', 'KeyType': 'HASH'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'booking_id', 'AttributeType': 'S'}
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            table.wait_until_exists()
        
        slot_key = slot_datetime.isoformat()
        attendee_name = user_name if user_name else user_email.split('@')[0]
        end_datetime = slot_datetime + timedelta(minutes=30)
        booking_id = f"booking-{int(slot_datetime.timestamp())}"
        
        # Store booking
        table.put_item(
            Item={
                'booking_id': booking_id,
                'slot_datetime': slot_key,
                'user_email': user_email,
                'user_name': attendee_name,
                'start_time': slot_datetime.strftime('%Y-%m-%d %H:%M:%S %Z'),
                'end_time': end_datetime.strftime('%Y-%m-%d %H:%M:%S %Z'),
                'status': 'confirmed',
                'created_at': datetime.now(pytz.utc).isoformat()
            }
        )
        
        # Send emails
        send_booking_emails(user_email, attendee_name, slot_datetime, end_datetime)
        
        return {
            'success': True,
            'booking_id': booking_id,
            'start_time': slot_datetime.strftime('%A, %B %d at %I:%M %p SGT'),
            'attendee_email': user_email
        }
    
    except Exception as e:
        print(f"Error creating booking: {str(e)}")
        return {'success': False, 'error': str(e)}


def send_booking_emails(user_email: str, user_name: str, start: datetime, end: datetime):
    """Send confirmation emails via AWS SES."""
    try:
        ses = get_ses_client()
        
        # Email to user
        user_html = f"""
        <html><body>
            <h2>Meeting Confirmed with Sahil Sharma 🎉</h2>
            <p>Hi {user_name},</p>
            <p>Your 30-minute meeting has been scheduled!</p>
            <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
                <strong>📅 {start.strftime('%A, %B %d at %I:%M %p SGT')}</strong><br>
                Duration: 30 minutes<br>
                With: Sahil Sharma (experiments.datas@gmail.com)
            </div>
            <p>Sahil will send you a Google Meet link before the meeting.</p>
            <p>Looking forward to our conversation!<br>- Sahil</p>
        </body></html>
        """
        
        ses.send_email(
            Source=SAHIL_EMAIL,
            Destination={'ToAddresses': [user_email]},
            Message={
                'Subject': {'Data': 'Meeting Confirmed with Sahil Sharma'},
                'Body': {'Html': {'Data': user_html}}
            }
        )
        
        # Email to Sahil
        sahil_html = f"""
        <html><body>
            <h2>New Meeting Booked</h2>
            <div style="background: #e8f5e9; padding: 15px;">
                <strong>📅 {start.strftime('%A, %B %d at %I:%M %p SGT')}</strong><br>
                With: {user_name} ({user_email})<br>
                Duration: 30 minutes
            </div>
            <p>Send Google Meet link to {user_email} before the meeting.</p>
        </body></html>
        """
        
        ses.send_email(
            Source=SAHIL_EMAIL,
            Destination={'ToAddresses': [SAHIL_EMAIL]},
            Message={
                'Subject': {'Data': f'New Meeting: {user_name}'},
                'Body': {'Html': {'Data': sahil_html}}
            }
        )
        
    except Exception as e:
        print(f"Error sending emails: {str(e)}")


# ===== GEMINI TOOL FUNCTIONS =====

def get_available_meeting_slots() -> str:
    """
    Show available 30-min meeting slots with Sahil.
    Called by Gemini when users ask about availability.
    """
    try:
        slots = get_available_slots(days_ahead=14)
        
        if not slots:
            return "No available slots in the next 14 days. Contact Sahil at experiments.datas@gmail.com"
        
        response = "📅 Available 30-minute meeting slots:\n\n"
        for idx, slot in enumerate(slots, 1):
            response += f"{idx}. {slot['formatted_time']}\n"
        
        response += "\nTo book: provide your email and slot number (e.g., 'Book slot 3, my email is you@example.com')"
        return response
    
    except Exception as e:
        print(f"Error in get_available_meeting_slots: {str(e)}")
        return "Error checking availability. Contact Sahil at experiments.datas@gmail.com"


def book_meeting(user_email: str, slot_index: int, user_name: str = "") -> str:
    """
    Book a meeting slot.
    Called by Gemini when users want to book.
    
    Args:
        user_email: User's email
        slot_index: Slot number (1-indexed)
        user_name: User's name (optional, defaults to email username)
    """
    try:
        # Validate email format
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', user_email):
            return "❌ Please provide a valid email address (e.g., name@company.com)"
        
        # Block disposable/spam email domains
        spam_domains = [
            'tempmail', 'throwaway', '10minutemail', 'guerrillamail', 'mailinator',
            'trashmail', 'fakeinbox', 'temp-mail', 'yopmail', 'maildrop', 'getnada',
            'sharklasers', 'guerrillamail', 'spam4', 'grr.la', 'mailnesia'
        ]
        email_domain = user_email.split('@')[1].lower()
        if any(spam in email_domain for spam in spam_domains):
            return "❌ Please use a valid business or personal email address. Disposable email addresses are not accepted."
        
        # Require a name for accountability (minimum 10 chars for full name)
        if not user_name or len(user_name.strip()) < 10:
            return "❌ Please provide your full name (first and last name, minimum 10 characters)."
        
        # Block suspicious patterns
        if user_name.lower() in ['test', 'fake', 'spam', 'admin', 'none', 'na', 'n/a']:
            return "❌ Please provide your real name."
        
        # Get slots
        slots = get_available_slots(days_ahead=14)
        if not slots:
            return "No available slots found."
        
        # Validate index
        if slot_index < 1 or slot_index > len(slots):
            return f"Invalid slot number. Choose 1-{len(slots)}."
        
        # Book it
        selected = slots[slot_index - 1]
        result = create_booking(user_email, selected['datetime'], user_name.strip())
        
        if result['success']:
            return f"✅ Meeting booked successfully!\n\n📅 {result['start_time']}\n👤 {user_name}\n📧 Confirmation sent to {result['attendee_email']}\n\nYou'll receive a confirmation email shortly. Sahil will send a Google Meet link before the meeting. Looking forward to connecting!"
        else:
            return f"❌ Couldn't book meeting: {result.get('error', 'Unknown error')}"
    
    except Exception as e:
        print(f"Error in book_meeting: {str(e)}")
        return "❌ Error booking meeting. Please contact Sahil directly at experiments.datas@gmail.com"
