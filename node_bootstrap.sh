# Generates the app.js for each portal
#
# It recieves as argument the node command to run for each portal:
# - watch
# - webpack
PORTALS=(admin customer credentialing representative)

[[ -z "$1" ]] && echo "ERROR: npm command as argument required" && exit 2

frontend() {
    cd ./frontend/src/$1
    if [ "$3" != 'noinstall' ]; then
        echo "$1: $(date +'%F %H:%M:%S') Installing node dependecies..."
        npm install
    fi
    echo "$1: Running: $2"
    npm run $2
}

export -f frontend

if [ "$1" == "watch:local" ]; then
    # Watch should be run in forked processes, because the processes will never
    # end
    for PORTAL in "${PORTALS[@]}"; do
        frontend $PORTAL watch:local $2&
    done
    wait
else
    for PORTAL in "${PORTALS[@]}"; do
        (
        # Run in a subshell
        frontend $PORTAL $1 $2
        )
    done
fi
