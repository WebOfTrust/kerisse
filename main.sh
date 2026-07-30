#!/bin/bash

# Sets the variable SCRIPT_DIR to the directory where the script itself is located.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Function to handle the user's choice
function handle_choice() {
    if [[ "$choice" == "1" ]]; then
        echo " "
        echo " "
        echo "  ************************************"
        echo "  Building the search index..."
        echo "  ************************************"
        echo " "
        echo " "
        show_progress
        npm run build:search-index
    elif [[ "$choice" == "2" ]]; then
        echo " "
        echo " "
        echo "  ************************************"
        echo "  Building (search index + webpack)..."
        echo "  ************************************"
        echo " "
        echo " "
        show_progress
        npm run build
    elif [[ "$choice" == "3" ]]; then
        echo " "
        echo " "
        echo "  ************************************"
        echo "  Starting the webpack dev server..."
        echo "  ************************************"
        echo " "
        echo " "
        show_progress
        npm run start
    elif [[ "$choice" == "4" ]]; then
        echo " "
        echo " "
        echo "  ************************************"
        echo "  Opening the scrape menu..."
        echo "  ************************************"
        echo " "
        echo " "
        show_progress
        npm run scrape
    elif [[ "$choice" == "5" ]]; then
        echo " "
        echo " "
        echo "  ************************************"
        echo "  Generating the scrape diagram..."
        echo "  ************************************"
        echo " "
        echo " "
        show_progress
        npm run diagram:scrape
    else
        clear
        echo " "
        echo " "
        echo "  ************************************"
        echo "  Goodbye! You chose to exit."
        echo "  ************************************"
        echo " "
        echo " "
    fi
}

# Function to display the introduction text
function display_intro() {
    clear
    echo " "
    echo " "
    echo "  ************************************"
    echo " "
    echo "  ╦╔═╔═╗╦═╗╦╔═╗╔═╗╔═╗ ┌─┐┬─┐┌─┐"
    echo "  ╠╩╗║╣ ╠╦╝║╚═╗╚═╗║╣  │ │├┬┘│ ┬"
    echo "  ╩ ╩╚═╝╩╚═╩╚═╝╚═╝╚═╝o└─┘┴└─└─┘ "
    echo " "
    echo " "
    echo "  Run package.json scripts from this menu."
    echo " "
    echo " "
    echo "  Please choose one of the following options:"
    echo " "
    echo "   [1] Build search index          (build:search-index)"
    echo " "
    echo "   [2] Build                       (build)"
    echo " "
    echo "   [3] Start dev server            (start)"
    echo " "
    echo "   [4] Scrape                      (scrape)"
    echo " "
    echo "   [5] Generate scrape diagram     (diagram:scrape)"
    echo " "
    echo "   [Q] Quit"
    echo " "
    echo " "
}

# Function to prompt the user for input
function prompt_input() {
    read -n 1 -r -p "  Enter your choice (1/2/3/4/5/Q)? " choice
    echo  # Empty line below the prompt
    echo  # Empty line below the prompt
}

# Function to show a short progress indicator
function show_progress() {
    for i in {1..5}
    do
      printf "."
      sleep 0.2
    done
    echo
    echo
}

# Main script starts here
display_intro
prompt_input
handle_choice

# End of script
