# API RA Events

This is a frontend web application that serves as a point for the user to query a location and receive a response showing the events that are closest to that location. This is still a work in progress, but the core functionality exists.

This is dependent on the main web scraping application here: [RA Music Events Grabber](https://github.com/hskingr/music_events_grabber)

### To Run

```
docker compose build
docker compose up
```

### Environmnet Variables

Mapbox Access Token needed to display the tiles for the map display.

`REACT_APP_MAPBOX_ACCESS_TOKEN`
