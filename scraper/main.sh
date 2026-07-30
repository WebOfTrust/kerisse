#!/bin/bash

source ".env"

# Sets the variable SCRIPT_DIR to the directory where the script itself is located.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"


# Function to handle the user's choice
function handle_choice() {
    if [[ "$choice" == "1" ]]; then
        echo " "
        echo " "
        echo "  ************************************"
        echo "  The script will now start scraping all sites."
        echo "  ************************************"
        echo " "
        echo " "
        show_progress
        do_scrape_all
    elif [[ "$choice" == "2" ]]; then
        echo " "
        echo " "
        echo "  ************************************"
        echo "  The script will now make a backup."
        echo "  ************************************"
        echo " "
        echo " "
        show_progress
        do_backup
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
    echo "  Various scripts related to scraping and building the search index."
    echo " "
    echo " "
    echo "  Please choose one of the following options:"
    echo " "
    echo "   [1] Scrape all sites (scrape + backup) *)"
    echo " "
    echo "   [2] Backup"
    echo " "
    echo "   [Q] Quit"
    echo " "
    echo " "
    echo "  *) The backup is always made after the scraping is finished"
    echo "     and is a copy of this latest scrape session."
    echo " "
    echo " "

}

# Function to prompt the user for input
function prompt_input() {
    read -n 1 -r -p "  Enter your choice (1/2/Q)? " choice
    echo  # Empty line below the prompt
    echo  # Empty line below the prompt
}

function do_scrape_all() {
    # Start scraping all sites.
    source "$SCRIPT_DIR/scrape_start.sh"
}

function do_scrape_prio_1() {
    # Start scraping priority sites only.
    source "$SCRIPT_DIR/scrape_prio_1_start.sh"
}

function do_scrape_test() {
    # Start scraping test.
    source "$SCRIPT_DIR/scrape_start_test.sh"
}

function do_backup() {
    # Start backing up.
    source "$SCRIPT_DIR/backup.sh"
}

# Function to show the progress of the scraping process
function show_progress() {
    for i in {1..5}
    do
      printf "."
      sleep 0.2
    done
}

# Main script starts here
display_intro
prompt_input
handle_choice

# End of script
