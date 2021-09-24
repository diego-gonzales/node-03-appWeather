const fs = require('fs');
const axios = require("axios");


class Searches {
    history = [];
    pathDB = './db/history.json';

    constructor(params) {
        this.readHistoryFromDB();
    };

    async searchCity(city = '') {
        try {
            const axiosInstance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${city}.json`,
                params: this.paramsMapbox
            });

            const { data: { features } } = await axiosInstance.get();

            return features.map( ({ id, place_name, center }) => ({ id, place_name, lng: center[0], lat: center[1] }));

        } catch (error) {
            return [];
            // throw error; // revienta la app
        };
    };

    async searchWeatherByCoordinates(lat, lon) {
        try {
            const axiosInstance = axios.create({
                baseURL: 'https://api.openweathermap.org/data/2.5/weather',
                params: { ...this.paramsOpenWeather, lat, lon }
            });

            const { data: { weather, main } } = await axiosInstance.get();

            return {
                weather_description: weather[0].description,
                temperature: main.temp,
                temp_min: main.temp_min,
                temp_max: main.temp_max
            };

        } catch (error) {
            console.log(error);
        };
    };

    addCityToHistory(city = '') {
        const cityAlreadyExistsInHistory = this.history.some(elemet => elemet === city);

        if (cityAlreadyExistsInHistory) return;

        this.history = this.history.splice(0, 4);
        this.history.unshift(city);
        this.saveHistoryOnDB();
    };

    saveHistoryOnDB() {
        // This is only in case there is a lot more data to save on db.
        // const dataToSave = {
        //     history: this.history
        // };

        fs.writeFileSync(this.pathDB, JSON.stringify(this.history))
    };

    readHistoryFromDB() {
        if(!fs.existsSync(this.pathDB)) return;

        const data = fs.readFileSync(this.pathDB, {encoding: 'utf-8'});
        const historyFromDB = JSON.parse(data);
        this.history = historyFromDB;
    };

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        };
    };

    get paramsOpenWeather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        };
    };

    // This method I don't use it, but it's a way to capitalize words.
    get capitalizeHistory() {
        return this.history.map(city => {
            let words = city.split(' ');
            words = words.map(word => word[0].toUpperCase() + word.substring(1));

            return words.join(' ');
        });
    };
};


module.exports = Searches;