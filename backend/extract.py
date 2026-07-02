import os
import json
from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel

# Load the secret key from the .env file
load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# ... (the rest of your code stays exactly the same)

# 2. Define the exact database structure we want the AI to output
class MCQ(BaseModel):
    question_number: int
    subject: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str 

class ExamPaper(BaseModel):
    questions: list[MCQ]

def extract_questions_from_pdf(pdf_path):
    print(f"Uploading {pdf_path} to Gemini... Please wait.")
    
    # Upload the PDF file
    uploaded_file = client.files.upload(file=pdf_path)
    
    print("Extracting 150 questions... This might take 1-2 minutes.")
    
    prompt = """
    Extract EVERY multiple choice question from this exam paper. 
    There should be exactly 150 questions. 
    Categorize the subject based on the section headers (e.g., Child Development, Tamil, English, Mathematics, Science/Social Science).
    If the correct answer is not marked in the PDF, leave 'correct_option' blank.
    """
    
    # Ask Gemini to return strict JSON matching our Pydantic schema
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[uploaded_file, prompt],
        config={
            "response_mime_type": "application/json",
            "response_schema": ExamPaper,
            "temperature": 0.1 # Keep it low so the AI doesn't get creative with the questions
        }
    )
    
    # 3. Save the output to a JSON file for Quality Control!
    output_filename = "extracted_data.json"
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write(response.text)
        
    print(f"Success! Data saved to {output_filename}. Please open it and verify all 150 questions are there.")

# To run this, place one of your PDFs (like '18-10-22 an.pdf') inside the backend folder.
# Then uncomment the line below and change the filename to match yours.

extract_questions_from_pdf("18-10-22 an.pdf")