import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def upload_exam():
    # 1. Read the JSON file Gemini created
    print("Reading extracted data...")
    with open("extracted_data.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # 2. Create the Question Bank folder in the database
    print("Creating Question Bank in database...")
    bank_response = supabase.table("question_banks").insert({
        "exam_date": "2022-10-17", # You can change this per PDF
        "session": "FN",           # You can change this per PDF
        "title": "TET 17-10-22 Forenoon Session"
    }).execute()
    
    # Get the unique ID of the bank we just created
    bank_id = bank_response.data[0]['id']
    
    # 3. Attach the bank_id to all 150 questions and upload them
    print("Uploading 150 questions... please wait.")
    questions_to_insert = []
    
    for q in data['questions']:
        q['question_bank_id'] = bank_id
        questions_to_insert.append(q)
        
    supabase.table("questions").insert(questions_to_insert).execute()
    print("✅ Success! All questions have been uploaded to Supabase.")

# Run the function
upload_exam()