#!/bin/bash

# ZAAR Deployment Script for Vercel

echo "🚀 Starting ZAAR deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "📝 Please login to Vercel first:"
    vercel login
fi

# Deploy to production
echo "📦 Building and deploying to production..."
vercel --prod

echo "✅ ZAAR successfully deployed to Vercel!"
echo "🌐 Check your Vercel dashboard for the deployment URL"
echo "📚 Don't forget to configure environment variables in Vercel dashboard!"
