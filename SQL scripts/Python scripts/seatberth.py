def generate_insert_statements(n, coach_id, sequence_name='sequence1', output_file='out.txt'):
    insert_lines = []
    for i in range(1, n + 1):
        seat_num = f"{i}"  # Pads with zeros to ensure 6 characters
        if i % 2 == 0:
            berth_position = 'H'
        else:
            berth_position = 'L'
        sql = f"INSERT INTO SEAT VALUES ({sequence_name}.nextval, '{seat_num}', {berth_position}, '{coach_id}');"
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
    generate_insert_statements(n=24, coach_id=f'C770{n:02}')
