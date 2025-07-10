start = 352
end = 400
p_travel_date = "TO_DATE('2025-06-25', 'YYYY-MM-DD')"
output_file = "ticket_insert_statements.sql"  # Specify the output file name

with open(output_file, "w") as f:  # Open the file in write mode
    for i in range(start, end):
        sql = f"INSERT INTO TICKET VALUES (TO_CHAR(sequence3.NEXTVAL),NULL,NULL,{i},DEFAULT,{p_travel_date},NULL,NULL);\n"
        f.write(sql)  # Write each SQL statement to the file

print(f"SQL insert statements written to {output_file}")