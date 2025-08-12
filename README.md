# 🔐 PassGen - Générateur de Mots de Passe Sécurisé

Une Single Page Web App (SPWA) moderne pour générer des mots de passe sécurisés avec calcul de force en temps réel et interface utilisateur intuitive.

## 📸 Aperçu

![PassGen Preview](https://media.discordapp.net/attachments/1211706182310436934/1404889686010363986/296E5936-1B47-4B01-9C6B-A64E53C1624F.png?ex=689cd4fa&is=689b837a&hm=8c9e6edf4e57df847c81b48dbc4cb91351e0a79db7371031aea1fcbe6fe9453d&=&format=webp&quality=lossless&width=970&height=930)


## ✨ Fonctionnalités

### 🔑 Fonctionnalités
- **Génération sécurisée** : Utilise `Window.crypto` avec caractères ASCII sécurisés
- **Calcul de force** : Intégration de zxcvbn pour une évaluation précise
- **4 Presets prédéfinis** :
  - 🔑 **Basique** : 12 caractères, lettres + chiffres
  - 🛡️ **Fort** : 16 caractères, lettres + chiffres + symboles
  - 🔢 **PIN** : 6 chiffres uniquement
  - 📝 **Phrase mémo** : Phrase française mémorable

### 🎨 Interface Utilisateur
- **Slider interactif** : Ajustement de longueur avec indicateur d'entropie
- **Feedback visuel** : Barre de force colorée et dynamique
- **Historique local** : Conservation des 3 dernières générations
- **Animation de copie** : Confirmation visuelle de la copie réussie

### 🛠️ Technologie
- **Architecture ES Modules** : Code moderne et modulaire
- **Accessibilité WCAG AA** : Support complet des lecteurs d'écran
- **PWA Ready** : Service Worker inclus pour utilisation hors ligne
- **Bundler Vite** : Build optimisé et développement rapide

## 🚀 Installation et Utilisation

### Méthode 1 : Utilisation directe (recommandée)
```bash
# Ouvrir directement index.html dans un navigateur
open index.html
```

### Méthode 2 : Avec serveur de développement
```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev

# Accès à http://localhost:3000
```

### Méthode 3 : Build de production
```bash
# Build optimisé
npm run build

# Prévisualisation
npm run preview
```

## 📱 Installation PWA

1. Ouvrez l'application dans un navigateur compatible
2. Cliquez sur l'icône d'installation dans la barre d'adresse
3. Confirmez l'installation
4. L'application sera disponible hors ligne

## 🔧 Architecture Technique

### Structure des fichiers
```
myPassGen/
├── index.html              # Interface principale
├── styles.css              # Styles avec variables CSS
├── js/
│   ├── PasswordGenerator.js # Logique de génération
│   └── app.js              # Interface et interactions
├── manifest.json           # Configuration PWA
├── sw.js                   # Service Worker
├── package.json            # Dépendances Node.js
├── vite.config.js          # Configuration Vite
└── README.md               # Documentation
```

### Classe PasswordGenerator

```javascript
// Utilisation basique
const generator = new PasswordGenerator();
const result = generator.generate({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
});

console.log(result.password);  // "Kx9#mP2$nQ8@vR1z"
console.log(result.strength);  // {score: 85, label: "Très forte"}
console.log(result.entropy);   // 104 bits
```

### Presets disponibles
```javascript
// Application d'un preset
const config = generator.applyPreset('fort');
const password = generator.generate(config);
```

## 🔒 Sécurité

- **Cryptographie sécurisée** : `crypto.getRandomValues()` pour la vraie randomisation
- **Exclusion de caractères ambigus** : Évite 0/O, 1/l/I par défaut
- **Validation d'entropie** : Calcul en temps réel de la force cryptographique
- **Pas de stockage cloud** : Toutes les données restent locales

## 🌍 Accessibilité

- Support complet des lecteurs d'écran
- Navigation au clavier (Ctrl+Entrée pour générer)
- Contrastes respectant WCAG AA
- Textes alternatifs et ARIA labels
- Support du mode sombre automatique

## 📊 Compatibilité

- **Navigateurs modernes** : Chrome 87+, Firefox 78+, Safari 14+, Edge 88+
- **Appareils mobiles** : iOS Safari, Chrome Android
- **PWA** : Installation sur bureau et mobile
- **Hors ligne** : Fonctionnement complet sans réseau

## 🎯 Utilisation

1. **Choisir un preset** ou configurer manuellement
2. **Ajuster la longueur** avec le slider (entropie en temps réel)
3. **Sélectionner les types de caractères** souhaités
4. **Générer** en cliquant le bouton ou Ctrl+Entrée
5. **Copier** d'un clic dans le presse-papiers
6. **Consulter l'historique** des 3 dernières générations

## 🔧 Développement

### Scripts disponibles
- `npm run dev` : Serveur de développement avec rechargement automatique
- `npm run build` : Build de production optimisé
- `npm run preview` : Prévisualisation du build
- `npm start` : Démarrage rapide sur tous les réseaux

### Personnalisation
- Variables CSS dans `:root` pour les couleurs et espacements
- Presets configurables dans `PasswordGenerator.js`
- Mots français modifiables pour les phrases mémo

## 📜 Licence

MIT License - Utilisation libre pour tous projets personnels et commerciaux.

---

**🔐 PassGen** - Générateur de mots de passe sécurisé - iiRelax
