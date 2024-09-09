# pymodules/__atlas_config_helpers.py

import configparser

config = configparser.ConfigParser()


def custom_timestamp_to_date(timestamp):
    seconds_per_year = 365.25 * 24 * 3600
    year = 1970 + int(timestamp // seconds_per_year)
    remaining_seconds = timestamp % seconds_per_year

    day_of_year = int(remaining_seconds // (24 * 3600))
    remaining_seconds %= 24 * 3600

    hour = int(remaining_seconds // 3600)
    remaining_seconds %= 3600

    minute = int(remaining_seconds // 60)
    second = int(remaining_seconds % 60)

    return f"Year: {year}, Day of Year: {day_of_year}, Time: {hour:02}:{minute:02}:{second:02}"
