 const config = {
    production: {
        API_BASE_URL: 'https://prod.karispharma.com',
        CLIENT_ID: 'tcOj9FBNuuBUdFIfRniDhr6Zht5tpMcvoVBTGM6p',
        CLIENT_SECRET: 'fFpZHvYiTa2Ekvw07emdTgLJaW2L8YONyj1yGEgQV6D4UiLqXcXpi5M6yrPHnTNHvqmoyKmAbVsWHSP7PdvliLMP7Gyt4HGjbJebTDjtMmur1gxHzTUx0WUeAmIQTvY3',
        CUSTOMER_PORTAL_URL: 'https://representative.karispharma.com/'
    },
    development: {
        API_BASE_URL: 'https://karis-stage.marcelo.ph',
        CLIENT_ID: 'FyirR6oLfulKaSOcbgBordqW9C903BljS8oiXC2I',
        CLIENT_SECRET: 'jig4Vlpec0PCFtLSTYe6g0rIeTADEEQWdeFw3x0UuzNy8EurBRCMgcGUawX6Vrq6u4F4uhhcVoEMYpI7ih0WdGo7WdbBNMLNOltw3oe0GcQKZueaVrYExkBCgi98afPB',
        CUSTOMER_PORTAL_URL: 'https://stage-representative.marcelo.ph/'
    },
    local: {
        API_BASE_URL: 'http://localhost:8000',
        CLIENT_ID: 'doR5Ud4nkDT1rfFxFr3NAuLYAxw7pPBfGRMeZ6IE',
        CLIENT_SECRET: 'yrKvlALB32JR8bHAiCZEpWZmaYm9bY4fQyjlKSGK350wjwV63j4qwiyHmETkceLqmnnHY4VRgRGkCOdSDrgD4usHagjiHd2TIiL63Ikegf6tLMKOTLo5kTgLQz7donk5',
        CUSTOMER_PORTAL_URL: 'http://localhost:8001/dist/representative/'
    }
};

export default config;
