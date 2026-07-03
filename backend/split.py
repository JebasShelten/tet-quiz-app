from pypdf import PdfReader, PdfWriter

def split_pdf(filename):
    print(f"Splitting {filename} into 6 parts...")
    reader = PdfReader(filename)
    pages_per_split = len(reader.pages) // 6
    
    for i in range(6):
        writer = PdfWriter()
        start = i * pages_per_split
        # Get the end page, or the very last page if it's the final chunk
        end = (i + 1) * pages_per_split if i < 5 else len(reader.pages)
        
        for p in range(start, end):
            writer.add_page(reader.pages[p])
            
        output_name = f"split_{i+1}_{filename}"
        with open(output_name, "wb") as f:
            writer.write(f)
        print(f"Created {output_name} (Pages {start+1} to {end})")

# Put your filename here
split_pdf("17-10-22 FN.pdf")