TOPOJSON = topojson
TOPOMERGE = topojson-merge
# http://www.naturalearthdata.com/downloads/
NATURAL_EARTH_CDN = http://naciscdn.org/naturalearth

all:

.SECONDARY:

zip/ne_10m_land.zip:
	mkdir -p $(dir $@)
	curl "$(NATURAL_EARTH_CDN)/10m/physical/ne_10m_land.zip" -o $@.download
	mv $@.download $@

zip/ne_10m_%.zip:
	mkdir -p $(dir $@)
	curl "$(NATURAL_EARTH_CDN)/10m/cultural/ne_10m_$*.zip" -o $@.download
	mv $@.download $@

zip/ne_50m_land.zip:
	mkdir -p $(dir $@)
	curl "$(NATURAL_EARTH_CDN)/50m/physical/ne_50m_land.zip" -o $@.download
	mv $@.download $@

zip/ne_50m_%.zip:
	mkdir -p $(dir $@)
	curl "$(NATURAL_EARTH_CDN)/50m/cultural/ne_50m_$*.zip" -o $@.download
	mv $@.download $@

zip/ne_110m_land.zip:
	mkdir -p $(dir $@)
	curl "$(NATURAL_EARTH_CDN)/110m/physical/ne_110m_land.zip" -o $@.download
	mv $@.download $@

zip/ne_110m_%.zip:
	mkdir -p $(dir $@)
	curl "$(NATURAL_EARTH_CDN)/110m/cultural/ne_110m_$*.zip" -o $@.download
	mv $@.download $@

shp/ne_%_land.shp: zip/ne_%_land.zip
	mkdir -p $(dir $@)
	unzip -d shp $<
	touch $@

shp/ne_%_tpp_countries.shp: zip/ne_%_admin_0_countries.zip
	mkdir -p $(dir $@)
	unzip -d shp $<
	ogr2ogr \
        -where "name in ('United States',
                         'Australia', \
						 'Brunei', \
						 'Canada', \
						 'Chile', \
						 'Japan', \
						 'Malaysia', \
						 'Mexico', \
						 'New Zealand', \
						 'Peru', \
						 'Singapore', \
						 'Vietnam')" \
		shp/ne_$*_tpp_countries.shp shp/ne_$*_admin_0_countries.shp
	touch $@

topo/tpp-%.json: shp/ne_%_tpp_countries.shp
	mkdir -p $(dir $@)
	$(TOPOJSON) \
		--quantization 1e5 \
		--id-property=+iso_n3 \
		-p name \
		--out $@ \
		-- countries=shp/ne_$*_tpp_countries.shp
