import os
import json
import time
from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

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

def extract_from_multiple_pdfs(pdf_list):
    all_questions = []
    
    for pdf_path in pdf_list:
        print(f"\n--- Uploading {pdf_path} to Gemini ---")
        uploaded_file = client.files.upload(file=pdf_path)
        
        prompt = """
        Extract ALL multiple choice questions from this exam paper document.
        Categorize the subject based on the section headers.
        If the correct answer is not marked, leave 'correct_option' blank.
        """
        
        # Retry settings
        max_retries = 3
        retry_count = 0
        success = False
        
        while retry_count < max_retries and not success:
            try:
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=[uploaded_file, prompt],
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": ExamPaper,
                        "temperature": 0.1 
                    }
                )
                
                batch_data = json.loads(response.text)
                all_questions.extend(batch_data['questions'])
                print(f"Successfully extracted {len(batch_data['questions'])} questions from {pdf_path}.")
                success = True
                
                # Cooldown period before moving to the next unique file
                print("Pausing for 15 seconds before the next file...")
                time.sleep(15)
                
            except Exception as e:
                retry_count += 1
                print(f"⚠️ Server error encountered on {pdf_path} (Attempt {retry_count}/{max_retries}): {e}")
                if retry_count < max_retries:
                    print("Waiting 30 seconds for the server to clear before retrying...")
                    time.sleep(30)
                else:
                    print(f"❌ Failed to process {pdf_path} after {max_retries} attempts. Stopping script.")
                    return
        
    final_output = {"questions": all_questions}
    with open("extracted_data.json", "w", encoding="utf-8") as f:
        json.dump(final_output, f, ensure_ascii=False, indent=4)
        
    print(f"\n✅ Success! Total of {len(all_questions)} questions stitched together and saved to extracted_data.json.")

# List the 6 split files for the 15-10-22 afternoon session
files_to_process = [
    "split_1_19-10-22 fn.pdf",
    "split_2_19-10-22 fn.pdf",
    "split_3_19-10-22 fn.pdf",
    "split_4_19-10-22 fn.pdf",
    "split_5_19-10-22 fn.pdf",
    "split_6_19-10-22 fn.pdf"
]

extract_from_multiple_pdfs(files_to_process)


