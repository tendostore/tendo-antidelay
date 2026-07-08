#!/system/bin/sh
# netfix_manager - runs in late_start service mode (system fully booted)
CONF_DIR="/data/adb/tendo_antidelay"
WHITELIST_FILE="$CONF_DIR/whitelist.list"
FREEZER_FILE="$CONF_DIR/freezer.state"
LOG="/data/local/tmp/tendo_antidelay.log"

mkdir -p "$CONF_DIR"

# Seed default config on first install
if [ ! -f "$WHITELIST_FILE" ]; then
    cat > "$WHITELIST_FILE" << 'EOF'
com.google.android.gms
EOF
fi
if [ ! -f "$FREEZER_FILE" ]; then
    echo "disabled" > "$FREEZER_FILE"
fi

# Wait for system to fully boot
until [ "$(getprop sys.boot_completed)" = "1" ]; do
    sleep 2
done
sleep 20

{
    echo "==== tendo_antidelay run: $(date) ===="

    # Apply freezer state
    FREEZER_STATE=$(cat "$FREEZER_FILE" 2>/dev/null)
    if [ "$FREEZER_STATE" = "disabled" ]; then
        cmd device_config put activity_manager_native_boot use_freezer false
    else
        cmd device_config put activity_manager_native_boot use_freezer true
    fi
    echo "use_freezer -> $(cmd device_config get activity_manager_native_boot use_freezer)"

    # Apply Doze whitelist for every package listed in config
    while IFS= read -r pkg; do
        [ -z "$pkg" ] && continue
        dumpsys deviceidle whitelist "+$pkg"
    done < "$WHITELIST_FILE"

    echo "whitelist applied for: $(cat "$WHITELIST_FILE" | tr '\n' ' ')"
    echo "==== done ===="
} >> "$LOG" 2>&1
