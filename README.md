# 🔐 PassGen - Générateur de Mots de Passe Sécurisé

Une Single Page Web App (SPWA) moderne pour générer des mots de passe sécurisés avec un calcul de force en temps réel et interface utilisateur simple et intuitive.

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

## 🚀 Installation et Utilisation

### Méthode 1 : Utilisation directe (recommandée)
```bash
# Ouvrir directement index.html dans un navigateur
open index.html
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


## 🎯 Utilisation

1. **Choisir un preset** ou configurer manuellement
2. **Ajuster la longueur** avec le slider (entropie en temps réel)
3. **Sélectionner les types de caractères** souhaités
4. **Générer** en cliquant le bouton ou Ctrl+Entrée
5. **Copier** d'un clic dans le presse-papiers
6. **Consulter l'historique** des 3 dernières générations

### Personnalisation
- Variables CSS dans `:root` pour les couleurs et espacements
- Presets configurables dans `PasswordGenerator.js`
- Mots français modifiables pour les phrases mémo

## 📜 Licence

MIT License - Utilisation libre pour tous projets personnels et commerciaux.

---

**🔐 PassGen** - Générateur de mots de passe sécurisé - iiRelax
