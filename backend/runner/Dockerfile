FROM alpine:3.19

# Install g++ with C++17 support and bash
RUN apk add --no-cache g++ libstdc++ bash coreutils

# Create sandbox working directory
WORKDIR /sandbox

# Create unprivileged runner user
RUN addgroup -S runnergroup && adduser -S runneruser -G runnergroup

# Ensure sandbox permissions
RUN chown -R runneruser:runnergroup /sandbox

USER runneruser

CMD ["/bin/bash"]
