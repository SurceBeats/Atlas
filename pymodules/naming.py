import random


def generate_name(seed, type="galaxy"):
    random.seed(seed)

    galaxy_prefixes = [
        "Andro", "Vega", "Cygnus", "Orion", "Luna", "Terra", "Hilla", "Proto", "Zena",
        "Quasar", "Nebula", "Omega", "Alpha", "Beta", "Delta", "Gamma", "Theta", 
        "Epsilon", "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi", 
        "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Zeta", "Nova", "Aster", 
        "Stella", "Astria", "Galax", "Cosmo", "Lunara", "Solaris", "Polaris", "Orbis", 
        "Pulsar", "Helios", "Cygni", "Vespera", "Andaris", "Altair", "Draco", "Hydra", "Sirius"
    ]

    galaxy_suffixes = [
        "mede", "nia", "lus", "ion", "aris", "os", "rex", "nor", "ara", "lis", "tor", "dex",
        "ran", "cor", "mel", "zon", "lox", "mir", "nus", "tir", "gorn", "zor", "fus", "tar",
        "tron", "nox", "ver", "grix", "nor", "rax", "bor", "fex", "mor", "dar", "tix", "vir",
        "ron", "zen", "xor", "nim", "thar", "gix", "vir", "xen", "pol", "fax", "lin", "dex", "fin", "yor"
    ]

    planet_prefixes = [
        "Xen", "Helio", "Astra", "Sol", "Gaia", "Triton", "Chrono", "Pyro", "Hydro", "Geo", 
        "Aero", "Electro", "Lumen", "Nox", "Terra", "Venus", "Mercur", "Mars", "Jupit", 
        "Saturn", "Nept", "Uran", "Pluto", "Eris", "Ceres", "Makemake", "Haumea", "Orcus", 
        "Varuna", "Ixion", "Quaor", "Sedna", "Triton", "Proteus", "Nereid", "Larissa", 
        "Charon", "Sycorax", "Miranda", "Oberon", "Titania", "Umbriel", "Dione", "Rhea", 
        "Tethys", "Iapetus", "Mimas", "Enceladus", "Phoebe", "Janus", "Epimetheus"
    ]

    planet_suffixes = [
        "on", "us", "ia", "ara", "or", "es", "is", "ix", "ar", "er", "ur", "or", "ax", "ys",
        "en", "ar", "ir", "os", "ix", "er", "as", "us", "ox", "um", "un", "us", "is", "en", 
        "or", "ix", "el", "ur", "yn", "us", "is", "ex", "an", "ir", "ox", "en", "us", "ax", 
        "os", "ix", "el", "ur", "yn", "is", "on", "or"
    ]

    word_list_1 = [
        "Rhode", "Ice", "Fire", "Wind", "Light", "Shadow", "Storm", "Sky", "Earth", "Ocean",
        "Thunder", "Star", "Sun", "Moon", "Flame", "Wave", "Forest", "Mountain", "Desert", "Frost",
        "Blaze", "Spirit", "Mist", "Blade", "Claw", "Wing", "Heart", "Soul", "Dream", "Echo",
        "Flare", "Raven", "Wolf", "Phoenix", "Lion", "Dragon", "Vortex", "Crystal", "Steel", "Obsidian",
        "Tempest", "Ember", "Aurora", "Nebula", "Dawn", "Dusk", "Night", "Twilight", "Gale", "Inferno"
    ]

    word_list_2 = [
        "of", "for", "under", "above", "beyond", "beneath", "within", "upon", "between", "around",
        "towards", "from", "into", "through", "against", "across", "amidst", "among", "before", "after"
    ]

    word_list_3 = [
        "Nature", "Chaos", "Order", "Harmony", "Balance", "Power", "Glory", "Destiny", "Fury", "Grace",
        "Wisdom", "Might", "Courage", "Valor", "Honor", "Wrath", "Silence", "Whispers", "Shadows", "Dreams",
        "Hope", "Fear", "Fortune", "Victory", "Revenge", "Legends", "Myth", "Secrets", "Legion", "Rebirth",
        "Despair", "Horizon", "Echoes", "Origins", "Eclipse", "Ascendancy", "Abyss", "Serenity", "Radiance", "Oblivion"
    ]

    if type == "system":
        # Generar un nombre compuesto de tres palabras
        name = f"{random.choice(word_list_1)} {random.choice(word_list_2)} {random.choice(word_list_3)}"
        # Agregar un número aleatorio
        number = f"{random.choice('abcdefghijklmnopqrstuvwxyz')}{random.randint(1, 999):03}"
        return f"{name} {number}"

    prefix = random.choice(galaxy_prefixes if type == "galaxy" else planet_prefixes)
    suffix = random.choice(galaxy_suffixes if type == "galaxy" else planet_suffixes)

    # Generar un número o "Original"
    if random.random() < 0.01:  # 1% de los casos
        number = "Original"
    else:
        number = f"{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}-{random.randint(1, 999):03}"

    return f"{prefix}{suffix} {number}"
