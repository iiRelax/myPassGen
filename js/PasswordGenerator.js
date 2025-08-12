/**
 * Générateur de mots de passe sécurisé utilisant Window.crypto
 * @class PasswordGenerator
 */
class PasswordGenerator {
    constructor(options = {}) {
        this.defaults = {
            length: 12,
            lowercase: true,
            uppercase: true,
            numbers: true,
            symbols: false,
            excludeSimilar: true, // Exclure les caractères similaires (0, O, l, I)
            ...options
        };

        // Ensembles de caractères ASCII sécurisés
        this.charSets = {
            lowercase: 'abcdefghijkmnopqrstuvwxyz', // Exclusion de 'l' pour éviter confusion
            uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ', // Exclusion de 'I' et 'O'
            numbers: '23456789', // Exclusion de '0' et '1'
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
            numbersComplete: '0123456789',
            lowercaseComplete: 'abcdefghijklmnopqrstuvwxyz',
            uppercaseComplete: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        };

        // Presets de configuration
        this.presets = {
            basique: {
                length: 12,
                lowercase: true,
                uppercase: true,
                numbers: true,
                symbols: false,
                excludeSimilar: true
            },
            fort: {
                length: 16,
                lowercase: true,
                uppercase: true,
                numbers: true,
                symbols: true,
                excludeSimilar: false
            },
            pin: {
                length: 6,
                lowercase: false,
                uppercase: false,
                numbers: true,
                symbols: false,
                excludeSimilar: false
            },
            phrase: {
                length: 24,
                lowercase: true,
                uppercase: true,
                numbers: true,
                symbols: true,
                excludeSimilar: false
            }
        };

        // Mots pour les phrases mémo (français courant)
        this.frenchWords = [
            'chat', 'chien', 'soleil', 'lune', 'eau', 'feu', 'terre', 'air',
            'rouge', 'bleu', 'vert', 'jaune', 'noir', 'blanc', 'grand', 'petit',
            'bon', 'mauvais', 'rapide', 'lent', 'chaud', 'froid', 'haut', 'bas',
            'jour', 'nuit', 'matin', 'soir', 'hier', 'demain', 'temps', 'espace',
            'maison', 'voiture', 'livre', 'fleur', 'arbre', 'oiseau', 'poisson', 'mer',
            'montagne', 'riviere', 'ville', 'campagne', 'route', 'pont', 'porte', 'fenetre'
        ];
    }

    /**
     * Génère un mot de passe selon les paramètres fournis
     * @param {Object} params - Paramètres de génération
     * @returns {Object} Objet contenant le mot de passe et ses métadonnées
     */
    generate(params = {}) {
        const config = { ...this.defaults, ...params };
        
        // Validation des paramètres
        if (config.length < 1 || config.length > 128) {
            throw new Error('La longueur doit être entre 1 et 128 caractères');
        }

        // Génération selon le type
        let password;
        if (params.preset === 'phrase') {
            password = this.#generatePassphrase(config);
        } else {
            password = this.#generatePassword(config);
        }

        // Calcul de la force
        const strength = this.#calculateStrength(password, config);
        
        // Calcul de l'entropie
        const entropy = this.#calculateEntropy(config);

        return {
            password,
            strength,
            entropy,
            config,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Génère un mot de passe classique
     * @private
     */
    #generatePassword(config) {
        const charset = this.#buildCharset(config);
        
        if (charset.length === 0) {
            throw new Error('Aucun ensemble de caractères sélectionné');
        }

        let password = '';
        const array = new Uint32Array(config.length);
        crypto.getRandomValues(array);

        for (let i = 0; i < config.length; i++) {
            const randomIndex = array[i] % charset.length;
            password += charset[randomIndex];
        }

        // Assurer qu'au moins un caractère de chaque type sélectionné est présent
        password = this.#ensureCharacterTypes(password, config);

        return password;
    }

    /**
     * Génère une phrase de passe mémorable
     * @private
     */
    #generatePassphrase(config) {
        const numWords = Math.max(3, Math.floor(config.length / 6));
        const words = [];
        
        // Sélection aléatoire de mots
        const array = new Uint32Array(numWords);
        crypto.getRandomValues(array);
        
        for (let i = 0; i < numWords; i++) {
            const randomIndex = array[i] % this.frenchWords.length;
            let word = this.frenchWords[randomIndex];
            
            // Capitalisation aléatoire
            if (config.uppercase && crypto.getRandomValues(new Uint8Array(1))[0] % 2) {
                word = word.charAt(0).toUpperCase() + word.slice(1);
            }
            
            words.push(word);
        }

        // Ajout de chiffres et symboles si demandés
        let passphrase = words.join('-');
        
        if (config.numbers) {
            const nums = new Uint32Array(2);
            crypto.getRandomValues(nums);
            passphrase += nums[0] % 100;
        }
        
        if (config.symbols) {
            const symbolSet = this.charSets.symbols;
            const symbolArray = new Uint32Array(1);
            crypto.getRandomValues(symbolArray);
            passphrase += symbolSet[symbolArray[0] % symbolSet.length];
        }

        return passphrase;
    }

    /**
     * Construit l'ensemble de caractères selon la configuration
     * @private
     */
    #buildCharset(config) {
        let charset = '';

        if (config.lowercase) {
            charset += config.excludeSimilar ? this.charSets.lowercase : this.charSets.lowercaseComplete;
        }
        if (config.uppercase) {
            charset += config.excludeSimilar ? this.charSets.uppercase : this.charSets.uppercaseComplete;
        }
        if (config.numbers) {
            charset += config.excludeSimilar ? this.charSets.numbers : this.charSets.numbersComplete;
        }
        if (config.symbols) {
            charset += this.charSets.symbols;
        }

        return charset;
    }

    /**
     * Assure qu'au moins un caractère de chaque type sélectionné est présent
     * @private
     */
    #ensureCharacterTypes(password, config) {
        const required = [];
        let charset = '';

        if (config.lowercase) {
            required.push(config.excludeSimilar ? this.charSets.lowercase : this.charSets.lowercaseComplete);
            charset += required[required.length - 1];
        }
        if (config.uppercase) {
            required.push(config.excludeSimilar ? this.charSets.uppercase : this.charSets.uppercaseComplete);
            charset += required[required.length - 1];
        }
        if (config.numbers) {
            required.push(config.excludeSimilar ? this.charSets.numbers : this.charSets.numbersComplete);
            charset += required[required.length - 1];
        }
        if (config.symbols) {
            required.push(this.charSets.symbols);
            charset += required[required.length - 1];
        }

        let passwordArray = password.split('');
        const array = new Uint32Array(required.length);
        crypto.getRandomValues(array);

        // Vérifier et remplacer si nécessaire
        for (let i = 0; i < required.length; i++) {
            const hasType = passwordArray.some(char => required[i].includes(char));
            if (!hasType) {
                const randomPos = array[i] % passwordArray.length;
                const randomChar = required[i][array[i] % required[i].length];
                passwordArray[randomPos] = randomChar;
            }
        }

        return passwordArray.join('');
    }

    /**
     * Calcule la force du mot de passe (version simplifiée de zxcvbn)
     * @private
     */
    #calculateStrength(password, config) {
        // Utiliser zxcvbn si disponible, sinon algorithme simplifié
        if (typeof zxcvbn !== 'undefined') {
            const result = zxcvbn(password);
            return {
                score: Math.round((result.score / 4) * 100),
                label: this.#getStrengthLabel(result.score),
                feedback: result.feedback,
                crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second
            };
        }

        // Algorithme simplifié
        let score = 0;
        const length = password.length;

        // Points pour la longueur
        if (length >= 8) score += 25;
        if (length >= 12) score += 25;
        if (length >= 16) score += 25;

        // Points pour la complexité
        if (/[a-z]/.test(password)) score += 5;
        if (/[A-Z]/.test(password)) score += 5;
        if (/[0-9]/.test(password)) score += 5;
        if (/[^a-zA-Z0-9]/.test(password)) score += 10;

        // Pénalités pour les patterns répétitifs
        if (/(.)\1{2,}/.test(password)) score -= 10;
        if (/123|abc|qwe/i.test(password)) score -= 15;

        score = Math.max(0, Math.min(100, score));

        return {
            score,
            label: this.#getStrengthLabel(Math.floor(score / 25)),
            feedback: this.#getSimpleFeedback(password, score)
        };
    }

    /**
     * Calcule l'entropie théorique
     * @private
     */
    #calculateEntropy(config) {
        const charset = this.#buildCharset(config);
        const charsetSize = charset.length;
        
        if (charsetSize === 0) return 0;
        
        // Entropie = longueur * log2(taille_alphabet)
        return Math.round(config.length * Math.log2(charsetSize));
    }

    /**
     * Retourne le label de force selon le score
     * @private
     */
    #getStrengthLabel(score) {
        const labels = ['Très faible', 'Faible', 'Moyenne', 'Forte', 'Très forte'];
        return labels[Math.min(score, 4)] || 'Très faible';
    }

    /**
     * Génère des conseils simplifiés
     * @private
     */
    #getSimpleFeedback(password, score) {
        const suggestions = [];
        
        if (password.length < 8) {
            suggestions.push('Utilisez au moins 8 caractères');
        }
        if (!/[a-z]/.test(password)) {
            suggestions.push('Ajoutez des lettres minuscules');
        }
        if (!/[A-Z]/.test(password)) {
            suggestions.push('Ajoutez des lettres majuscules');
        }
        if (!/[0-9]/.test(password)) {
            suggestions.push('Ajoutez des chiffres');
        }
        if (!/[^a-zA-Z0-9]/.test(password)) {
            suggestions.push('Ajoutez des symboles');
        }

        return {
            suggestions,
            warning: score < 50 ? 'Ce mot de passe est facilement devinable' : ''
        };
    }

    /**
     * Applique un preset de configuration
     */
    applyPreset(presetName) {
        if (!this.presets[presetName]) {
            throw new Error(`Preset '${presetName}' non trouvé`);
        }
        return { ...this.presets[presetName] };
    }

    /**
     * Retourne la liste des presets disponibles
     */
    getPresets() {
        return Object.keys(this.presets);
    }
}

export default PasswordGenerator;
