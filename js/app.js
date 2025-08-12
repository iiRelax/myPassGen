/**
 * Application principale du générateur de mots de passe
 */
import PasswordGenerator from './PasswordGenerator.js';

class PasswordApp {
    constructor() {
        this.generator = new PasswordGenerator();
        this.currentConfig = this.generator.defaults;
        this.history = this.loadHistory();
        
        this.initializeElements();
        this.bindEvents();
        this.applyPreset('basique');
        this.updateDisplay();
    }

    /**
     * Initialise les références aux éléments DOM
     */
    initializeElements() {
        // Presets
        this.presetButtons = document.querySelectorAll('.preset-btn');
        
        // Configuration
        this.lengthSlider = document.getElementById('length-slider');
        this.lengthDisplay = document.getElementById('length-display');
        this.entropyDisplay = document.getElementById('entropy-display');
        
        // Options de caractères
        this.characterOptions = document.getElementById('character-options');
        this.lowercaseCheck = document.getElementById('lowercase');
        this.uppercaseCheck = document.getElementById('uppercase');
        this.numbersCheck = document.getElementById('numbers');
        this.symbolsCheck = document.getElementById('symbols');
        
        // Génération et résultat
        this.generateBtn = document.getElementById('generate-btn');
        this.passwordField = document.getElementById('password-field');
        this.copyBtn = document.getElementById('copy-btn');
        
        // Indicateur de force
        this.strengthFill = document.getElementById('strength-fill');
        this.strengthLabel = document.getElementById('strength-label');
        this.strengthScore = document.getElementById('strength-score');
        
        // Historique
        this.historyList = document.getElementById('history-list');
        
        // Notification
        this.copyNotification = document.getElementById('copy-notification');
    }

    /**
     * Lie les événements aux éléments
     */
    bindEvents() {
        // Presets
        this.presetButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handlePresetChange(btn));
        });

        // Slider de longueur
        this.lengthSlider.addEventListener('input', () => this.handleLengthChange());
        
        // Options de caractères
        [this.lowercaseCheck, this.uppercaseCheck, this.numbersCheck, this.symbolsCheck]
            .forEach(checkbox => {
                checkbox.addEventListener('change', () => this.handleOptionsChange());
            });

        // Génération
        this.generateBtn.addEventListener('click', () => this.generatePassword());
        
        // Copie
        this.copyBtn.addEventListener('click', () => this.copyPassword());
        
        // Raccourci clavier pour générer
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.generatePassword();
            }
        });

        // Auto-génération au changement de paramètres
        [this.lengthSlider, this.lowercaseCheck, this.uppercaseCheck, this.numbersCheck, this.symbolsCheck]
            .forEach(element => {
                element.addEventListener('change', () => {
                    // Petite temporisation pour éviter la génération excessive
                    clearTimeout(this.autoGenerateTimer);
                    this.autoGenerateTimer = setTimeout(() => {
                        if (this.passwordField.value) {
                            this.generatePassword();
                        }
                    }, 300);
                });
            });
    }

    /**
     * Gère le changement de preset
     */
    handlePresetChange(clickedBtn) {
        // Mise à jour de l'interface
        this.presetButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-checked', 'false');
        });
        
        clickedBtn.classList.add('active');
        clickedBtn.setAttribute('aria-checked', 'true');

        // Application du preset
        const presetName = clickedBtn.dataset.preset;
        this.applyPreset(presetName);
    }

    /**
     * Applique un preset de configuration
     */
    applyPreset(presetName) {
        const presetConfig = this.generator.applyPreset(presetName);
        this.currentConfig = { ...this.currentConfig, ...presetConfig, preset: presetName };

        // Mise à jour de l'interface
        this.lengthSlider.value = presetConfig.length;
        this.lowercaseCheck.checked = presetConfig.lowercase;
        this.uppercaseCheck.checked = presetConfig.uppercase;
        this.numbersCheck.checked = presetConfig.numbers;
        this.symbolsCheck.checked = presetConfig.symbols;

        // Gestion spéciale pour le preset PIN et phrase
        if (presetName === 'pin') {
            this.characterOptions.style.display = 'none';
        } else if (presetName === 'phrase') {
            this.characterOptions.style.display = 'block';
            // Pour les phrases, on ajuste la longueur automatiquement
            this.lengthSlider.style.display = 'none';
        } else {
            this.characterOptions.style.display = 'block';
            this.lengthSlider.style.display = 'block';
        }

        this.updateDisplay();
    }

    /**
     * Gère le changement de longueur
     */
    handleLengthChange() {
        this.currentConfig.length = parseInt(this.lengthSlider.value);
        this.updateDisplay();
    }

    /**
     * Gère le changement des options de caractères
     */
    handleOptionsChange() {
        this.currentConfig.lowercase = this.lowercaseCheck.checked;
        this.currentConfig.uppercase = this.uppercaseCheck.checked;
        this.currentConfig.numbers = this.numbersCheck.checked;
        this.currentConfig.symbols = this.symbolsCheck.checked;
        
        this.updateDisplay();
    }

    /**
     * Met à jour l'affichage des paramètres
     */
    updateDisplay() {
        // Longueur
        this.lengthDisplay.textContent = this.currentConfig.length;
        
        // Entropie
        const entropy = this.calculateEntropy();
        this.entropyDisplay.textContent = `~${entropy} bits`;
        
        // Validation des options
        this.validateOptions();
    }

    /**
     * Calcule l'entropie selon la configuration actuelle
     */
    calculateEntropy() {
        let charsetSize = 0;
        
        if (this.currentConfig.lowercase) charsetSize += 26;
        if (this.currentConfig.uppercase) charsetSize += 26;
        if (this.currentConfig.numbers) charsetSize += 10;
        if (this.currentConfig.symbols) charsetSize += 32;
        
        if (charsetSize === 0) return 0;
        
        return Math.round(this.currentConfig.length * Math.log2(charsetSize));
    }

    /**
     * Valide que au moins une option est sélectionnée
     */
    validateOptions() {
        const hasAnyOption = this.currentConfig.lowercase || 
                            this.currentConfig.uppercase || 
                            this.currentConfig.numbers || 
                            this.currentConfig.symbols;

        this.generateBtn.disabled = !hasAnyOption;
        
        if (!hasAnyOption) {
            this.generateBtn.innerHTML = `
                <span class="btn-icon">⚠️</span>
                <span class="btn-text">Sélectionnez au moins une option</span>
            `;
        } else {
            this.generateBtn.innerHTML = `
                <span class="btn-icon">🎲</span>
                <span class="btn-text">Générer un mot de passe</span>
            `;
        }
    }

    /**
     * Génère un nouveau mot de passe
     */
    async generatePassword() {
        try {
            // Animation du bouton
            this.generateBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.generateBtn.style.transform = '';
            }, 100);

            // Génération
            const result = this.generator.generate(this.currentConfig);
            
            // Affichage
            this.passwordField.value = result.password;
            this.updateStrengthIndicator(result.strength);
            
            // Ajout à l'historique
            this.addToHistory(result);
            
            // Focus sur le champ pour l'accessibilité
            this.passwordField.focus();
            
        } catch (error) {
            console.error('Erreur lors de la génération:', error);
            this.showError('Erreur lors de la génération du mot de passe');
        }
    }

    /**
     * Met à jour l'indicateur de force
     */
    updateStrengthIndicator(strength) {
        const score = strength.score;
        const label = strength.label;
        
        // Classe CSS selon le score
        let strengthClass = 'very-weak';
        if (score >= 80) strengthClass = 'very-strong';
        else if (score >= 60) strengthClass = 'strong';
        else if (score >= 40) strengthClass = 'medium';
        else if (score >= 20) strengthClass = 'weak';
        
        // Mise à jour de la barre
        this.strengthFill.className = `strength-fill ${strengthClass}`;
        
        // Mise à jour du texte
        this.strengthScore.textContent = `${label} (${score}%)`;
        this.strengthScore.className = `strength-score ${strengthClass}`;
        
        // Feedback zxcvbn si disponible
        if (strength.feedback && strength.feedback.suggestions) {
            const suggestions = strength.feedback.suggestions.join('. ');
            if (suggestions) {
                this.strengthFill.title = suggestions;
            }
        }
    }

    /**
     * Copie le mot de passe dans le presse-papiers
     */
    async copyPassword() {
        const password = this.passwordField.value;
        
        if (!password) {
            this.showError('Aucun mot de passe à copier');
            return;
        }

        try {
            await navigator.clipboard.writeText(password);
            this.showCopySuccess();
            
            // Animation du bouton de copie
            this.copyBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.copyBtn.style.transform = '';
            }, 150);
            
        } catch (error) {
            // Fallback pour les navigateurs plus anciens
            this.copyPasswordFallback(password);
        }
    }

    /**
     * Méthode de copie alternative
     */
    copyPasswordFallback(password) {
        this.passwordField.select();
        this.passwordField.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (error) {
            this.showError('Impossible de copier le mot de passe');
        }
    }

    /**
     * Affiche la notification de copie réussie
     */
    showCopySuccess() {
        this.copyNotification.classList.add('show');
        
        setTimeout(() => {
            this.copyNotification.classList.remove('show');
        }, 2000);
    }

    /**
     * Affiche une erreur
     */
    showError(message) {
        // Simple alert pour le moment, peut être amélioré avec une notification personnalisée
        alert(message);
    }

    /**
     * Ajoute un mot de passe à l'historique
     */
    addToHistory(result) {
        // Ajouter au début du tableau
        this.history.unshift({
            password: result.password,
            strength: result.strength,
            timestamp: result.timestamp,
            config: result.config
        });

        // Limiter à 3 éléments
        this.history = this.history.slice(0, 3);
        
        // Sauvegarder et afficher
        this.saveHistory();
        this.renderHistory();
    }

    /**
     * Affiche l'historique
     */
    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<p class="history-empty">Aucun mot de passe généré récemment</p>';
            return;
        }

        this.historyList.innerHTML = this.history.map(item => {
            const date = new Date(item.timestamp);
            const timeStr = date.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            let strengthClass = 'very-weak';
            const score = item.strength.score;
            if (score >= 80) strengthClass = 'very-strong';
            else if (score >= 60) strengthClass = 'strong';
            else if (score >= 40) strengthClass = 'medium';
            else if (score >= 20) strengthClass = 'weak';

            return `
                <div class="history-item">
                    <div class="history-password">${this.maskPassword(item.password)}</div>
                    <div class="history-meta">
                        <div class="history-strength ${strengthClass}">${item.strength.label}</div>
                        <div class="history-time">${timeStr}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Masque partiellement le mot de passe pour l'historique
     */
    maskPassword(password) {
        if (password.length <= 8) {
            return password.substring(0, 2) + '•'.repeat(password.length - 4) + password.substring(password.length - 2);
        }
        return password.substring(0, 3) + '•'.repeat(Math.min(8, password.length - 6)) + password.substring(password.length - 3);
    }

    /**
     * Charge l'historique depuis le localStorage
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('passgen-history');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.warn('Impossible de charger l\'historique:', error);
            return [];
        }
    }

    /**
     * Sauvegarde l'historique dans le localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem('passgen-history', JSON.stringify(this.history));
        } catch (error) {
            console.warn('Impossible de sauvegarder l\'historique:', error);
        }
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    window.passwordApp = new PasswordApp();
});

// Service Worker pour PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('sw.js');
            console.log('Service Worker enregistré:', registration);
        } catch (error) {
            console.warn('Échec de l\'enregistrement du Service Worker:', error);
        }
    });
}
