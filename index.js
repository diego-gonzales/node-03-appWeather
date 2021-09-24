require('dotenv').config();

const { readInputForCreateTask, inquirerMenu, pause, showOptionsOfCities } = require("./helpers/inquirer");
const Searches = require("./models/Searches");


const main = async() => {

    let optionSelected;
    const searches = new Searches();

    do {
        optionSelected = await inquirerMenu();

        switch (optionSelected) {
            case 1:
                const cityToSearch = await readInputForCreateTask('City to search: ');
                const matchingCities = await searches.searchCity(cityToSearch);
                const selectedCityID = await showOptionsOfCities(matchingCities);

                if (selectedCityID === '0') continue; 

                const { place_name, lng, lat } = matchingCities.find(city => city.id === selectedCityID); // 'find' method return an object

                searches.addCityToHistory(place_name);

                const { weather_description, temperature, temp_min, temp_max } = await searches.searchWeatherByCoordinates(lat, lng);

                console.clear();
                console.log('\nCity Information\n'.blue);
                console.log('City:', place_name.green);
                console.log('Lat:', lat);
                console.log('Lng:', lng);
                console.log('Temperature:', temperature);
                console.log('Min. Temperature:', temp_min);
                console.log('Max. Temperature:', temp_max);
                console.log('What is the weather like?', weather_description.green);
                break;

            case 2:
                console.clear();
                console.log('\nHistory\n'.blue);
                searches.history.forEach((element, index) => {
                    const idx = `${index + 1}.`.green;
                    console.log(`${idx} ${element}`);
                });
                break;
        
            default:
                break;
        };

        if (optionSelected !== 0) await pause();

    } while (optionSelected !== 0);
};

main();