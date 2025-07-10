def generate_insert_statements(n, coach_id, sequence_name='sequence1', output_file='out.txt'):
    insert_lines = []
    for i in range(1, n + 1):
        seat_num = f"{i}"  # Pads with zeros to ensure 6 characters
        sql = f"INSERT INTO SEAT VALUES ({sequence_name}.nextval, '{seat_num}', NULL, '{coach_id}');"
        insert_lines.append(sql)

    script = "\n".join(insert_lines)

    if output_file:
        with open(output_file, 'a') as f:
            f.write(script + "\n")
        print(f"SQL insert script written to {output_file}")
    else:
        print(script)


# Example usage

# Example usage
for n in range(1, 3):
    generate_insert_statements(n=48, coach_id=f'C760{n:02}')
for n in range(3, 9):
    generate_insert_statements(n=80, coach_id=f'C760{n:02}')
for n in range(9, 14):
    generate_insert_statements(n=105, coach_id=f'C760{n:02}')  # Change n to how many you want
