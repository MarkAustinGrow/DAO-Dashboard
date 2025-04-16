# Docker Deployment Guide for Marvin Dashboard

This guide provides instructions for building, running, and deploying the Marvin Dashboard application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your local machine
- A Linode account for deployment
- Supabase project with necessary tables and configuration

## Local Development with Docker

### Building the Docker Image

```bash
cd marvin-dashboard
docker build -t marvin-dashboard .
```

### Running the Container Locally

```bash
# Using docker run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  marvin-dashboard

# OR using docker-compose (recommended)
# First, update the environment variables in docker-compose.yml
docker-compose up
```

Visit `http://localhost:3000` to see your application running.

## Deploying to Linode

### Option 1: Deploy to a Linode VM

1. **Create a Linode VM**

   - Log in to your Linode account
   - Create a new Linode (recommended: Ubuntu 22.04 LTS with at least 2GB RAM)
   - Set up SSH access

2. **Install Docker and Docker Compose on the VM**

   ```bash
   # Connect to your Linode
   ssh root@your_linode_ip

   # Update packages
   apt update && apt upgrade -y

   # Install Docker
   apt install -y docker.io

   # Install Docker Compose
   apt install -y docker-compose

   # Start and enable Docker
   systemctl start docker
   systemctl enable docker
   ```

3. **Deploy Your Application**

   ```bash
   # Create a directory for your app
   mkdir -p /opt/marvin-dashboard
   cd /opt/marvin-dashboard

   # Copy your files to the server (from your local machine)
   scp -r Dockerfile docker-compose.yml .dockerignore root@your_linode_ip:/opt/marvin-dashboard/

   # OR clone from your Git repository
   git clone https://github.com/yourusername/marvin.git /opt/marvin-dashboard

   # Update environment variables in docker-compose.yml
   nano docker-compose.yml

   # Build and start the container
   docker-compose up -d
   ```

4. **Set Up Nginx as a Reverse Proxy (Optional but Recommended)**

   ```bash
   # Install Nginx
   apt install -y nginx

   # Create Nginx configuration
   nano /etc/nginx/sites-available/marvin-dashboard

   # Add the following configuration
   server {
       listen 80;
       server_name your_domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }

   # Enable the site
   ln -s /etc/nginx/sites-available/marvin-dashboard /etc/nginx/sites-enabled/

   # Test Nginx configuration
   nginx -t

   # Restart Nginx
   systemctl restart nginx
   ```

5. **Set Up SSL with Let's Encrypt (Optional but Recommended)**

   ```bash
   # Install Certbot
   apt install -y certbot python3-certbot-nginx

   # Obtain SSL certificate
   certbot --nginx -d your_domain.com

   # Certbot will automatically update your Nginx configuration
   ```

### Option 2: Deploy Using Linode Container Registry

1. **Create a Container Registry in Linode**

   - Go to the Linode Cloud Manager
   - Navigate to Container Registry
   - Create a new registry

2. **Push Your Image to the Registry**

   ```bash
   # Log in to the Linode Container Registry
   docker login registry.linode.com

   # Tag your image
   docker build -t registry.linode.com/your-registry/marvin-dashboard:latest .

   # Push the image
   docker push registry.linode.com/your-registry/marvin-dashboard:latest
   ```

3. **Deploy Using Linode Kubernetes Engine (LKE)**

   - Create a Kubernetes cluster in Linode
   - Configure kubectl to connect to your cluster
   - Create Kubernetes deployment and service files
   - Apply the configuration to deploy your application

## Environment Variables

Make sure to set the following environment variables for your application:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Monitoring and Maintenance

- **View Container Logs**

  ```bash
  docker logs -f marvin-dashboard
  # OR
  docker-compose logs -f
  ```

- **Restart the Container**

  ```bash
  docker restart marvin-dashboard
  # OR
  docker-compose restart
  ```

- **Update the Application**

  ```bash
  # Pull latest code
  git pull

  # Rebuild and restart
  docker-compose up -d --build
  ```

## Troubleshooting

- **Container Won't Start**: Check logs with `docker logs marvin-dashboard`
- **Can't Connect to Supabase**: Verify environment variables and network connectivity
- **Performance Issues**: Consider scaling up your Linode VM or optimizing your application

## Security Considerations

- Never commit sensitive environment variables to your repository
- Consider using Linode's Object Storage for static assets
- Regularly update your Docker images and dependencies
- Set up proper firewall rules on your Linode VM
