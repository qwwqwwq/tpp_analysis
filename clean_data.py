import pandas
import json
import functools
import sys
import re
import numpy

SPLIT = re.compile('[0-9.$](?=[^0-9.$])')

class ModificationTypes():
    PROPORTION = 'proportion'
    AD_VALOREM = 'ad_valorem'

COUNTRIES = [
    u'Australia', u'Brunei',
    u'Canada', u'Chile', u'Japan', u'Malaysia', u'Mexico', u'New Zealand',
    u'Peru', u'Singapore', u'Vietnam']

def read_code_mappings():
    with open("US_code_map.json") as f:
	return json.load(f)

def parse_value(s):
    if is_percent(s):
	return float(s.strip().strip('%')), '%'
    if len(s.split()) == 1 and '/' in s:
	scalar, units = s.split('/', 1)
	units = '/' + units
    else:
	scalar, units = s.split(None, 1)
    scalar = scalar.strip()
    # $1 /1000 -> 1 $ /1000
    if scalar.startswith('$'):
	units = '$ ' + units
	scalar = scalar.strip('$')
    return float(scalar), units

def is_percent(s):
    return s.strip().endswith('%')

def us_base_rate_modification(base_rate, modification):
    if base_rate.strip() == 'Free':
	return '0.0%'
    if ModificationTypes.PROPORTION in modification:
	scalar, units = parse_value(base_rate)
	return str(scalar * modification[ModificationTypes.PROPORTION]) + units
    elif ModificationTypes.AD_VALOREM in modification:
	return str(modification[ModificationTypes.AD_VALOREM]) + '%'

def read_schedule():
    return pandas.read_csv("TPP-Final-Text-US-Tariff-Elimination-Schedule.csv")

def process_row(year, code_map, row):
    for country in COUNTRIES:
	if row[country] in code_map:
	    row[country] = us_base_rate_modification(row['Base Rate'], code_map[row[country]][year])
	else:
	    row[country] = numpy.nan
    return row

def process_year(schedule, code_map, year):
    return (schedule.apply(functools.partial(process_row, year, code_map), axis=1))

def process_years(schedule, code_map):
    for i in range(30):
	df = process_year(read_schedule(), read_code_mappings(), i)
	import ipdb; ipdb.set_trace()

if __name__ == '__main__':
    df = process_years(read_schedule(), read_code_mappings())
