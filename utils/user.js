module.exports.formatGeoLocationResultForUserSchema = (
  geoLocationResult = {},
) => {
  const keyMappings = {
    ip: 'ip',
    countryCode: 'country_code',
    utcOffset: 'utc_offset',
    ipVersion: 'ip_version',
    region: 'region',
    city: 'city',
    regionCode: 'region_code',
    countryName: 'country_name',
  }
  let formattedResult = {}

  Object.keys(keyMappings).forEach((key) => {
    formattedResult[key] = geoLocationResult[keyMappings[key]]
  })
  formattedResult.location = {
    type: 'Point',
    coordinates: [geoLocationResult.longitude, geoLocationResult.latitude],
  }
  return formattedResult
}
