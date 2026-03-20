# Manual Docker Image Publishing

Quick guide for manually building and publishing CI Docker images.

## Prerequisites

**Create GitHub Classic Token** (one-time setup):

1. Go to
   [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. "Generate new token" → "Generate new token (classic)"
3. Check `write:packages`
4. Generate and copy token

## Publish Docker Image

```bash
# 1. Login to GitHub Container Registry
echo YOUR_TOKEN | docker login ghcr.io -u SlavaMelanko --password-stdin

# 2. Set up Docker Buildx (required for multi-platform builds)
docker buildx create --use --name multiplatform-builder || docker buildx use multiplatform-builder

# 3. Build and push multi-platform image
# Choose one based on your needs:

# For local development:
docker build -f Dockerfile.ci -t smela-front-ci .

# For dev & main branches:
docker buildx build --platform linux/amd64,linux/arm64 \
  -f Dockerfile.ci \
  -t ghcr.io/slavamelanko/smela-front-ci:dev \
  -t ghcr.io/slavamelanko/smela-front-ci:main \
  --push .

# For current branch (e.g., sentry, docker, feature-x):
docker buildx build --platform linux/amd64,linux/arm64 \
  -f Dockerfile.ci \
  -t ghcr.io/slavamelanko/smela-front-ci:$(git branch --show-current) \
  --push .

# 4. Verify multi-platform manifest (should show both linux/amd64 and linux/arm64)
# Replace <tag> with: dev, main, or your branch name
docker manifest inspect ghcr.io/slavamelanko/smela-front-ci:<tag> | jq '.manifests[] | select(.platform.architecture != "unknown") | {platform: .platform, size: .size}'

# Examples:
docker manifest inspect ghcr.io/slavamelanko/smela-front-ci:dev | jq '.manifests[] | select(.platform.architecture != "unknown") | {platform: .platform, size: .size}'
docker manifest inspect ghcr.io/slavamelanko/smela-front-ci:main | jq '.manifests[] | select(.platform.architecture != "unknown") | {platform: .platform, size: .size}'
docker manifest inspect ghcr.io/slavamelanko/smela-front-ci:sentry | jq '.manifests[] | select(.platform.architecture != "unknown") | {platform: .platform, size: .size}'

# 5. Pull and test on your platform
docker pull ghcr.io/slavamelanko/smela-front-ci:<tag>

# Examples:
docker pull ghcr.io/slavamelanko/smela-front-ci:dev
docker pull ghcr.io/slavamelanko/smela-front-ci:main
docker pull ghcr.io/slavamelanko/smela-front-ci:sentry
```

## Test Image Locally

After building the image, you can test it interactively:

```bash
# Run container interactively
docker run -it --rm smela-front-ci bash

# Inside the container, verify installations:

# 1. Check pnpm and Node versions
pnpm --v && node --v
```
