#!/usr/bin/env python
"""
Exports a table as a CSV

Usage:
    ./util/export_csv.py [options]

Options:
    -h --help           Show this text.
    --url <url>         URL string to connect to CockroachDB
    --table <table>     Name of the table to export
"""

from docopt import docopt
from connect_with_sqlalchemy import build_engine, build_sqla_connection_string


def get_table(engine, table):
    return engine.execute("SELECT * FROM {}".format(table))


def get_vehicles(engine):
    return engine.execute("SELECT * FROM vehicles")


def print_header(columns):
    header_row = ['"{}"'.format(c) for c in columns]
    print(','.join(header_row))


def print_vehicles_row(row):
    row_arr = ['"{}"'.format(c) for c in row]
    row_arr[1] = row_arr[1].strip('"')
    row_arr[2] = row_arr[2].strip('"')
    row_arr[3] = row_arr[3].strip('"')
    row_arr[3] = row_arr[3].replace("'", '"')
    row_arr[3] = "'{}'".format(row_arr[3])
    print("|".join(row_arr))


def print_row(row):
    row_arr = ['"{}"'.format(c) for c in row]
    print("|".join(row_arr))


def main():
    opts = docopt(__doc__)
    sqla_connection_string = build_sqla_connection_string(opts['--url'])
    engine = build_engine(sqla_connection_string)
    table_name = opts['--table']
    table = get_table(engine, table_name)
    columns = table.keys()
    # print_header(columns)
    if table_name == 'vehicles':
        for row in table:
            print_vehicles_row(row)
    else:
        for row in table:
            print_row(row)


if __name__ == '__main__':
    main()
