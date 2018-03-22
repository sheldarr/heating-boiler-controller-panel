const translations = {
    pl: {
        "heating-boiler-controller-panel": "Panel sterownika wentylatora",
        "Mode": "Tryb",
        "NORMAL": "Termostat",
        "FORCED_FAN_OFF": "Wyłączony wentylator",
        "FORCED_FAN_ON": "Włączony wentylator",
        "Setpoint": "Temperatura zadana [°C]",
        "Hysteresis": "Histereza [°C]",
        "Last measurements": "Liczba ostatnich pomiarów",
        "Power": "Moc [%]",
        "Save": "Zapisz",
        "Refresh": "Odśwież",
        "Output": "Wyjście",
        "Input": "Wejście",
        "Fan": "Wentylator",
        "ON": "WŁĄCZONY",
        "OFF": "WYŁĄCZONY",
        "Last sync": "Ostatnia synchronizacja",
        "Input Temperature": "Temperatura Wejściowa",
        "Output Temperature": "Temperatura Wyjściowa",
        "Settings saved!": "Ustawienia zapisane!"
    }
}

export default (key) => {
    const translation = translations.pl[key]

    if(!translation) {
        console.warn(`Missing translation ${key}`);

        return key;
    };

    return translation;
}