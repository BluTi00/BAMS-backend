Backend for Startup Application Management System.

// Run Redis in Docker

// volume in the host machine -> may cause container freeze
docker run -d \
 --name redis \
 -p 6379:6379 \
 -v ~/redis-data:/data \
 redis:7 \
 redis-server --appendonly yes --requirepass "SuperStrongPassword123"

// volume inside the container (recommended)
docker run -d \
 --name redis \
 -p 6379:6379 \
 -v redisdata:/data \
 redis:7 \
 redis-server --appendonly yes --requirepass "SuperStrongPassword123"
