import fitz  # PyMuPDF
import re

# Function to parse the PDF and extract the data
def extract_pdf_info(pdf_file_path):
    try:
        # Open the PDF file
        doc = fitz.open(pdf_file_path)
        pdf_text = ""

        # Extract text from all pages
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            pdf_text += page.get_text("text")

        # Parse the extracted text to find the required information using regex
        extracted_data = {
            "respond_to_contact": None,
            "home_phone": None,
            "email": None,
            "name": None,
            "assigned_to_employee": None,
            "homesite_contract_closed_date": None,
            "customer_request_date": None,
            "date_sent_to_contractor": None,
            "notes": None
        }

        # Example Regex to match patterns in the PDF text
        extracted_data["respond_to_contact"] = re.search(r'Respond to Contact:\s*(\S.*)', pdf_text)
        extracted_data["home_phone"] = re.search(r'Home Phone:\s*(\S.*)', pdf_text)
        extracted_data["email"] = re.search(r'Email:\s*(\S+@\S+)', pdf_text)
        extracted_data["name"] = re.search(r'Name:\s*(\S.*)', pdf_text)
        extracted_data["assigned_to_employee"] = re.search(r'Assigned to Employee:\s*(\S.*)', pdf_text)
        extracted_data["homesite_contract_closed_date"] = re.search(r'Homesite Contract Closed Date:\s*(\S.*)', pdf_text)
        extracted_data["customer_request_date"] = re.search(r'Customer Request Date:\s*(\S.*)', pdf_text)
        extracted_data["date_sent_to_contractor"] = re.search(r'Date Sent to Contractor:\s*(\S.*)', pdf_text)
        extracted_data["notes"] = re.search(r'Notes:\s*(\S.*)', pdf_text)

        # Convert regex match objects to strings, if found
        for key, value in extracted_data.items():
            if value:
                extracted_data[key] = value.group(1)

        return extracted_data

    except Exception as e:
        print(f"Error while extracting data from the PDF: {e}")
        return None


# Path to your PDF file
pdf_file_path = "path_to_your_pdf_file.pdf"

# Call the function to extract data
warranty_info = extract_pdf_info(pdf_file_path)

# Print the extracted information
if warranty_info:
    print("Extracted Warranty Information:")
    for key, value in warranty_info.items():
        print(f"{key}: {value}")