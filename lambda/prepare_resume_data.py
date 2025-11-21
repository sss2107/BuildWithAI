"""
Prepare resume data for RAG chatbot
Extracts content from your portfolio and creates embeddings
"""

import json
from pathlib import Path

def extract_resume_data():
    """Extract all content from your portfolio files"""
    
    resume_data = {
        "personal_info": {
            "name": "Sahil Sharma",
            "title": "Senior Data Scientist | AI & GenAI Specialist",
            "location": "Singapore",
            "email": "sahil21@u.nus.edu",
            "phone": "+65 93952564",
            "linkedin": "https://www.linkedin.com/in/sahil-sharma-13540375/",
            "github": "https://github.com/sss2107",
            "highlights": [
                "Google Developer Expert (GDE) in AI/ML",
                "Senior Data Scientist at Singapore Airlines",
                "7+ Years in AI/ML Engineering",
                "Master's in Data Science from NUS",
                "40+ Technologies Mastered"
            ]
        },
        
        "projects": [],
        "skills": {},
        "experience": [],
        "education": [],
        "achievements": []
    }
    
    # Read AI Projects
    projects_file = Path("content/AI_Projects.txt")
    if projects_file.exists():
        content = projects_file.read_text()
        # You'll parse this to extract project details
        resume_data["projects_raw"] = content
    
    # Add more sections as needed
    
    return resume_data

def create_chunks_for_rag(resume_data):
    """
    Create text chunks optimized for RAG retrieval
    Each chunk should be self-contained with context
    """
    
    chunks = []
    
    # Personal info chunk
    personal = resume_data["personal_info"]
    chunks.append({
        "id": "personal_1",
        "type": "personal_info",
        "text": f"{personal['name']} is a {personal['title']} based in {personal['location']}. "
                f"Highlights: {', '.join(personal['highlights'])}",
        "metadata": {
            "section": "introduction",
            "email": personal["email"],
            "phone": personal["phone"]
        }
    })
    
    # TODO: Add project chunks, education chunks, etc.
    
    return chunks

def save_chunks(chunks, output_file="resume_chunks.json"):
    """Save chunks for embedding"""
    with open(output_file, 'w') as f:
        json.dump(chunks, f, indent=2)
    print(f"✅ Saved {len(chunks)} chunks to {output_file}")

if __name__ == "__main__":
    resume_data = extract_resume_data()
    chunks = create_chunks_for_rag(resume_data)
    save_chunks(chunks)
    print(f"📊 Resume data prepared: {len(chunks)} chunks ready for embedding")
