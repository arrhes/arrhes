# Configuration

Ce document decrit toutes les variables d'environnement et les configurations necessaires pour faire fonctionner Comptasse en developpement local.

## Table des matieres

- [Vue d'ensemble](#vue-densemble)
- [Variables d'environnement - API](#variables-denvironnement---api)
- [Variables d'environnement - Tools](#variables-denvironnement---tools)
- [Configuration PostgreSQL](#configuration-postgresql)
- [Configuration S3 (Stockage)](#configuration-s3-stockage)
- [Exemples de configuration](#exemples-de-configuration)
- [Securite](#sécurité)

## Vue d'ensemble

Toutes les variables d'environnement (API, outils) sont injectees directement par `docker-compose`. Aucun fichier `.env` n'est necessaire.

### Approches de configuration

**Option 1 : Avec Docker Compose (Recommande)**

Le fichier `.workflows/dev/compose.yml` lance automatiquement PostgreSQL et RustFS avec des valeurs par defaut pretes a l'emploi. Cette option simplifie la configuration.

**Option 2 : Installation native**

Vous installez et configurez manuellement chaque service sur votre machine.

Ce document couvre les deux approches.

## Variables d'environnement - API

Definies dans le service `api` du fichier `.workflows/dev/compose.yml`.

### Environnement general

| Variable | Type | Description | Exemple |
|----------|------|-------------|---------|
| `ENV` | `"development"` \| `"production"` | Environnement d'execution | `development` |
| `VERBOSE` | `"true"` \| `"false"` | Mode verbeux (logs detailles) | `true` |
| `PORT` | `string` | Port d'ecoute du serveur | `3000` |

### CORS et Cookies

| Variable | Type | Description | Exemple |
|----------|------|-------------|---------|
| `CORS_ORIGIN` | `string` | Origines autorisees (separees par virgule) | `http://localhost:5173` |
| `COOKIES_DOMAIN` | `string` | Domaine des cookies | `localhost` |
| `COOKIES_KEY` | `string` | Cle secrete pour signer les cookies (min 32 chars) | `your-super-secret-key-min-32-characters-long` |
| `USER_SESSION_COOKIE_MAX_AGE` | `number` | Duree de vie des cookies de session (en secondes, defaut 1 an) | `31536000` |

### URLs des services

| Variable | Type | Description | Exemple |
|----------|------|-------------|---------|
| `API_BASE_URL` | `string` | URL de base de l'API | `http://localhost:3000` |
| `WEBSITE_BASE_URL` | `string` | URL du site vitrine | `http://localhost:5173` |

### Base de donnees

| Variable | Type | Description | Exemple |
|----------|------|-------------|---------|
| `SQL_DATABASE_URL` | `string` | URL de connexion PostgreSQL | `postgres://postgres:admin@localhost:5432/default` |

### Stockage S3

| Variable | Type | Description | Exemple |
|----------|------|-------------|---------|
| `STORAGE_ENDPOINT` | `string` | Endpoint S3 (ou compatible) | `http://localhost:9000` (RustFS) |
| `STORAGE_BUCKET_NAME` | `string` | Nom du bucket S3 | `comptasse-files` |
| `STORAGE_ACCESS_KEY` | `string` | Cle d'acces S3 | `rustfsadmin` |
| `STORAGE_SECRET_KEY` | `string` | Cle secrete S3 | `rustfsadmin` |

### OCR

| Variable | Type | Description | Exemple |
|----------|------|-------------|---------|
| `OCR_API_KEY` | `string` | Cle API du fournisseur OCR (BYOK). Optionnelle ; une erreur est renvoyee si l'OCR est utilise sans cle. | `your-ocr-api-key` |
| `OCR_ENDPOINT` | `string` | Endpoint de l'API OCR | `https://api.mistral.ai/v1/ocr` |
| `OCR_MODEL` | `string` | Modele OCR | `mistral-ocr-latest` |

## Variables d'environnement - Tools

Definies dans le service `api` du fichier `.workflows/dev/compose.yml` (les scripts `tools` heritent de l'environnement du container).

| Variable | Type | Description | Exemple |
|----------|------|-------------|---------|
| `DATABASE_URL` | `string` | URL de connexion PostgreSQL | `postgres://postgres:admin@localhost:5432/default` |

**Note :** Cette variable doit pointer vers la meme base de donnees que `SQL_DATABASE_URL` de l'API.

## Configuration PostgreSQL

### Option 1 : Avec Docker Compose (Recommande)

Aucune installation manuelle requise ! Le fichier `.workflows/dev/compose.yml` configure automatiquement PostgreSQL.

**Lancer PostgreSQL :**
```bash
docker compose -f .workflows/dev/compose.yml up -d postgres
```

**Configuration par defaut :**
- **Host** : `localhost`
- **Port** : `5432`
- **Database** : `default`
- **User** : `postgres`
- **Password** : `admin`
- **URL** : `postgres://postgres:admin@localhost:5432/default`

**Verification de la connexion :**
```bash
psql postgres://postgres:admin@localhost:5432/default
```

**Commandes utiles :**
```bash
# Voir les logs
docker compose -f .workflows/dev/compose.yml logs postgres

# Redemarrer
docker compose -f .workflows/dev/compose.yml restart postgres

# Arreter
docker compose -f .workflows/dev/compose.yml stop postgres
```

### Option 2 : Installation native

**Ubuntu/Debian :**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS (Homebrew) :**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Windows :**
Telecharger l'installeur depuis [postgresql.org](https://www.postgresql.org/download/windows/)

**Creation de la base de donnees :**
```bash
# Se connecter a PostgreSQL
sudo -u postgres psql

# Creer un utilisateur
CREATE USER comptasse_user WITH PASSWORD 'your-secure-password';

# Creer la base de donnees
CREATE DATABASE comptasse OWNER comptasse_user;

# Donner tous les privileges
GRANT ALL PRIVILEGES ON DATABASE comptasse TO comptasse_user;

# Quitter
\q
```

**URL de connexion :**

Format : `postgres://[user]:[password]@[host]:[port]/[database]`

Exemple : `postgres://comptasse_user:your-secure-password@localhost:5432/comptasse`

**Verification de la connexion :**
```bash
psql postgres://comptasse_user:your-secure-password@localhost:5432/comptasse
```

## Configuration S3 (Stockage)

Le systeme de stockage utilise l'API AWS S3 mais fonctionne avec n'importe quel service compatible S3.

### Option 1 : Avec Docker Compose (Recommande)

Le fichier `.workflows/dev/compose.yml` lance automatiquement RustFS.

**Lancer RustFS :**
```bash
docker compose -f .workflows/dev/compose.yml up -d rustfs
```

**Configuration par defaut :**
- **Endpoint** : `http://localhost:9000`
- **Web Console** : http://localhost:9001
- **Access Key** : `rustfsadmin`
- **Secret Key** : `rustfsadmin`
- **Bucket** : `comptasse-files` (a creer)

**Variables d'environnement :**
```env
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_BUCKET_NAME=comptasse-files
STORAGE_ACCESS_KEY=rustfsadmin
STORAGE_SECRET_KEY=rustfsadmin
```

**Creation du bucket :**

Via l'interface web :
1. Acceder a http://localhost:9001
2. Se connecter avec `rustfsadmin` / `rustfsadmin`
3. Cliquer sur "Buckets" > "Create Bucket"
4. Nommer le bucket `comptasse-files`

**Commandes utiles :**
```bash
# Voir les logs
docker compose -f .workflows/dev/compose.yml logs rustfs

# Redemarrer
docker compose -f .workflows/dev/compose.yml restart rustfs
```

### Option 2 : RustFS standalone (sans Docker Compose)

**Installation avec Docker :**
```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name rustfs \
  -e "RUSTFS_ACCESS_KEY=rustfsadmin" \
  -e "RUSTFS_SECRET_KEY=rustfsadmin" \
  -e "RUSTFS_CONSOLE_ENABLE=true" \
  -e "RUSTFS_VOLUMES=/data" \
  -v ~/rustfs/data:/data \
  rustfs/rustfs:latest
```

Suivez ensuite les memes etapes de creation de bucket que ci-dessus.

### Option 3 : AWS S3 (Production)

**Configuration :**
```env
STORAGE_ENDPOINT=https://s3.eu-west-3.amazonaws.com
STORAGE_BUCKET_NAME=your-bucket-name
STORAGE_ACCESS_KEY=YOUR_AWS_ACCESS_KEY
STORAGE_SECRET_KEY=YOUR_AWS_SECRET_KEY
```

**Prerequis :**
- Creer un bucket S3 dans votre region
- Creer un utilisateur IAM avec les permissions S3 appropriees
- Generer des cles d'acces pour cet utilisateur

### Option 4 : Autre service compatible S3

Cloudflare R2, DigitalOcean Spaces, Scaleway Object Storage, etc. sont egalement compatibles.

## Exemples de configuration

### Configuration avec Docker Compose (Recommande)

Cette configuration utilise tous les services lances par `.workflows/dev/compose.yml`.

**Etape 1 : Lancer les services**
```bash
docker compose -f .workflows/dev/compose.yml up -d
```

**Etape 2 : Variables d'environnement**

Aucun fichier `.env` n'est necessaire. Les variables du service `api` sont definies directement dans `.workflows/dev/compose.yml` :

```yaml
environment:
  ENV: development
  VERBOSE: "true"
  PORT: "3000"
  CORS_ORIGIN: localhost
  COOKIES_DOMAIN: localhost
  COOKIES_KEY: development-secret-key-change-in-production-min-32-chars
  USER_SESSION_COOKIE_MAX_AGE: "31536000"
  API_BASE_URL: "http://localhost:3000"
  WEBSITE_BASE_URL: "http://localhost:5173"
  SQL_DATABASE_URL: "postgres://postgres:admin@localhost:5432/default"
  STORAGE_ENDPOINT: "http://localhost:9000"
  STORAGE_BUCKET_NAME: comptasse-files
  STORAGE_ACCESS_KEY: rustfsadmin
  STORAGE_SECRET_KEY: rustfsadmin
```

Le service `tools` herite du meme environnement pour `DATABASE_URL` / `SQL_DATABASE_URL`.

### Configuration avec services externes (Production)

Les variables d'environnement sont injectees via `docker-compose` (par exemple le service `comptasse` de `.workflows/build/compose.yml`) ou le manager de secrets de votre infrastructure :

```env
ENV=production
VERBOSE=false
PORT=3000

CORS_ORIGIN=https://your-domain.com
COOKIES_DOMAIN=your-domain.com
COOKIES_KEY=generate-a-strong-random-key-here-minimum-32-characters
USER_SESSION_COOKIE_MAX_AGE=31536000

API_BASE_URL=https://api.your-domain.com
WEBSITE_BASE_URL=https://your-domain.com

SQL_DATABASE_URL=postgres://user:pass@db.provider.com:5432/comptasse?sslmode=require

STORAGE_ENDPOINT=https://s3.eu-west-3.amazonaws.com
STORAGE_BUCKET_NAME=my-comptasse-bucket
STORAGE_ACCESS_KEY=VOTRE_CLE_ACCES_S3
STORAGE_SECRET_KEY=VOTRE_CLE_SECRETE_S3
```

## Securite

### Bonnes pratiques

1. **Ne jamais commiter de secrets dans le code ou les fichiers de configuration**
   - Injectez les secrets par `docker-compose` ou un secrets manager
   - Utilisez des valeurs par defaut de developpement uniquement dans `.workflows/dev/compose.yml`

2. **Generer des secrets forts**
   ```bash
   # Generer une cle aleatoire pour COOKIES_KEY
   openssl rand -base64 32
   ```

3. **Secrets par environnement**
   - Dev : valeurs par defaut dans `.workflows/dev/compose.yml`
   - Production : variables d'environnement systeme ou secrets manager
   - Ne jamais melanger les credentials

4. **Rotation des secrets**
   - Changez regulierement `COOKIES_KEY`
   - Renouvelez les cles de stockage et mots de passe
   - Revoquez les acces inutilises

### Verification de la configuration

Pour verifier que toutes les variables sont correctement definies, l'API affichera une erreur au demarrage si des variables sont manquantes ou invalides (validation via Valibot dans `getEnv.ts`).

### Valeurs recommandees

| Variable | Recommandation |
|----------|----------------|
| `COOKIES_KEY` | Minimum 32 caracteres aleatoires |
| `SQL_DATABASE_URL` | Connexion SSL en production (`?sslmode=require`) |
| `STORAGE_*` | Credentials avec permissions minimales (lecture/ecriture bucket uniquement) |

---

Pour poursuivre l'installation, consultez [DEVELOPMENT.md](DEVELOPMENT.md).
