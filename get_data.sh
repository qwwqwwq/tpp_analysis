#!/bin/bash
wget https://ustr.gov/sites/default/files/TPP-Final-Text-US-General-Notes-to-Tariff-Schedule.pdf
wget https://ustr.gov/sites/default/files/TPP-Final-Text-US-Tariff-Elimination-Schedule.pdf
wget https://ustr.gov/sites/default/files/TPP-Final-Text-US-Appendix-A-Tariff-Rate-Quotas.pdf
PAGES=$(pdfinfo TPP-Final-Text-US-Tariff-Elimination-Schedule.pdf | grep Pages: | awk '{print $2}')

mkdir -p TPP-Final-Text-US-Tariff-Elimination-Schedule
for PAGE in $(seq 1 $PAGES)
do
    echo "Page $PAGE..."
    ../tabula-extractor/bin/tabula \
	--spreadsheet \
	--pages $PAGE \
	TPP-Final-Text-US-Tariff-Elimination-Schedule.pdf \
	-o TPP-Final-Text-US-Tariff-Elimination-Schedule/$PAGE.csv
done

pdftotext TPP-Final-Text-US-General-Notes-to-Tariff-Schedule.html

awk '
    /^4.$/ { p=1 } 
    /^5.$/ { p=0 } 
    /^\(/ { q=1 } 
    /^$/ { q=0 } 
    {if(p && q) {print}}
' TPP-Final-Text-US-General-Notes-to-Tariff-Schedule.txt | \
tr '\n' ' '  | \
tr '(' '\n' | sed '/^\s*$/d'> elimination_code_descriptions.txt
