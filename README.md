# FOLKS Shoot

**A web-based self-service photobooth developed for FOLKS Open House 2026.**

FOLKS Shoot is an event-focused photobooth application built with Next.js. It lets visitors capture photos through a browser, choose a frame, add stickers, and retrieve their finished images through a session-specific album. The project was designed to run locally at the event, with tunnel-based access to allow visitors to open their albums on their own devices.

> **Project status:** Completed · Inactive maintenance  
> This repository preserves the implementation used for FOLKS Open House 2026. No active development or regular maintenance is currently planned. The source remains available for reference and future adaptation.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Deployment Notes](#deployment-notes)
- [Maintenance and Security](#maintenance-and-security)
- [Contributors and Contact](#contributors-and-contact)

## Features

- **Browser-based photo capture:** Take photos using a connected webcam, with a capture countdown.
- **Multiple layouts:** Choose between a single-photo composition and a photostrip.
- **Frame customization:** Select from event-specific frame designs.
- **Photo editing:** Adjust brightness and saturation, and place decorative stickers on photos.
- **Cloud-based image storage:** Upload finished images and, where supported by the layout, original captures to Cloudinary.
- **Session albums:** Retrieve photos using a session-specific album link and four-digit PIN.
- **Admin dashboard:** View photo sessions, access uploaded images, and manage session records.

## Technology Stack

| Technology | Purpose |
| --- | --- |
| Next.js 16 and React 19 | Application framework and user interface |
| JavaScript | Application logic |
| Tailwind CSS 3 | Styling |
| react-webcam | Browser camera capture |
| HTML Canvas | Frame composition and image processing |
| Cloudinary | Photo uploads and storage |
| Lucide React | Interface icons |

The project also includes Google API and QR code dependencies. Refer to the source code for their specific usage.

## How It Works

1. **Choose a layout and frame.** Visitors select a single-photo or photostrip format.
2. **Capture photos.** The application uses a connected camera to take the required shots.
3. **Customize the result.** Visitors adjust the appearance of their photos and add stickers.
4. **Generate and upload.** The application combines the photos with the selected design and uploads the resulting image.
5. **Access the album.** Visitors receive a session-specific album link and PIN to view or download their photos.

An administrative interface is available at `/admin` for authorized operators.

## Getting Started

### Prerequisites

- Node.js and npm compatible with the project's Next.js version
- A browser with webcam access
- A Cloudinary account for the upload and album features

### Local installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/ShiroTenma/folks-shoot.git
cd folks-shoot
npm ci
```

Create a `.env.local` file in the project root and configure the required environment variables below. Then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser and allow camera access when prompted.

Other available scripts:

```bash
npm run build   # Create a production build
npm run start   # Start the production server after building
npm run lint    # Run ESLint
```

> The setup steps reflect the repository's configuration; they have not been verified against a fresh installation. Cloud-backed features require valid credentials and an appropriate deployment environment.

## Configuration

The application references the following environment variables:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `ADMIN_PASSWORD` | Password used by the administrative API |

Example `.env.local` structure (replace placeholders with your own values):

```dotenv
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_PASSWORD=replace_with_a_strong_password
```

Never commit API credentials, private keys, or real visitor images to the repository.

## Project Structure

```text
public/
  frames/                # Photo frame and layout assets
  stickers/              # Decorative sticker assets
src/
  app/
    admin/               # Admin dashboard
    album/[id]/          # Session-specific photo album
    api/
      admin/             # Session administration endpoints
      album/             # Album lookup endpoint
      upload/            # Photo upload endpoint
    components/          # Camera, selection, editing, and result steps
    utils/               # Canvas image generation and frame configuration
    page.js              # Main photobooth workflow
```

## Deployment Notes

FOLKS Shoot was originally intended for a locally hosted event setup, with a tunnel providing access to album links from other devices. Its existing Next.js configuration contains an event-specific allowed development origin, which will need to be updated or removed for a different environment.

Webcam access depends on browser permissions and secure-context requirements. A new deployment should be tested with its intended camera, network, storage account, and visitor devices rather than assuming the original event setup will work unchanged.

## Maintenance and Security

This project is no longer under active development or routine maintenance. It is shared as an example of an event-specific implementation, not as a production-ready, security-audited photobooth service.

Before redeploying it publicly, review upload authentication and rate limiting, admin authentication, album access controls, photo privacy and retention, dependency security, and cloud-storage permissions. In particular, the existing upload API does not enforce authentication or rate limiting.

## Contributors and Contact

Developed for FOLKS Open House 2026 by:

- [secretceremony](https://github.com/secretceremony)
- [ShiroTenma](https://github.com/ShiroTenma)

For questions about the project or its implementation, please contact either contributor through their GitHub profile.
