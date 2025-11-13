# Deploying to Vercel

This guide will help you deploy the Cultural Alignment Annotation Platform to Vercel.

## What was configured

The following changes were made to support Vercel deployment:

1. **vercel.json** - Configuration file that tells Vercel how to build and deploy the Flask application
2. **app.py** - Added `handler = app` for Vercel serverless compatibility
3. **requirements.txt** - Added gunicorn production server
4. **.gitignore** - Updated with Python and Vercel best practices

## How to deploy

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed (optional, for command-line deployment)

### Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Prepare for Vercel deployment"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect the Python Flask application
   - Click "Deploy"

### Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Select "Python" as the framework when asked
   - Vercel will automatically detect the Flask app

## Important considerations

### File System Limitations

⚠️ **Important**: Vercel's serverless environment has a read-only file system except for the `/tmp` directory. The application code writes to:
- `outputs/autosave/`
- `outputs/judgment/`
- `outputs/writing/`

In serverless environments, these writes may not persist across function invocations. For production use:

1. **Short-term solution**: The app will work within a single session, but autosave data may not persist across server restarts
2. **Long-term solution**: Consider integrating with a database (e.g., Vercel Postgres, MongoDB Atlas) for persistent storage

### Environment Variables

If you need to add environment variables:

1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add your variables (e.g., `FLASK_ENV=production`)

### Custom Domain

To add a custom domain:

1. Go to your project in Vercel Dashboard
2. Settings → Domains
3. Add your custom domain and follow the DNS configuration instructions

## Local Development

For local development, you can still use:

```bash
python start_platform.py
```

Or directly:

```bash
python app.py
```

## Troubleshooting

### Build fails with Python version errors
- Make sure your code is compatible with Python 3.9 (Vercel's default runtime)
- You can specify a different version in `vercel.json` if needed

### Static files not loading
- Check that the `static/` directory is committed to git
- Ensure templates in `templates/` are also committed

### File writing errors
- This is expected in serverless environments
- Consider using a database for production deployments

## Next Steps

For a production deployment, consider:
1. Adding authentication to protect the annotation platform
2. Using a persistent database for storing annotations
3. Adding rate limiting
4. Setting up monitoring and error tracking
