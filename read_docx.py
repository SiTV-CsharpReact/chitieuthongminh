import docx

doc = docx.Document('/Users/sivan/chitieuthongminh/database_documentation.docx')
for i, t in enumerate(doc.tables):
    print(f'\n--- Table {i+1} ---')
    for row in t.rows:
        row_data = [cell.text.strip().replace('\n', ' ') for cell in row.cells]
        print(' | '.join(row_data))
