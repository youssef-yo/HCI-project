# Development - Contributing

If you already cloned the repository, here are some guidelines to setup your environment.

## API Module Configuration

In order to work with the `api` module, you first need to make a few arrangements. Below are shown the step for Debian based Linux distributions.

### Python Setup

You must install at least Python 3.12 on your local machine, you can do so by doing:

```shell
# Add Launchpad PPA to the repositories list
sudo add-apt-repository ppa:deadsnakes/ppa

# Update package list information
sudo apt update

# Install Python 3.12 (append -full to install all extras)
sudo apt install python3.12
```

### Poetry Setup

Dependency management is handled by [Poetry](https://python-poetry.org/docs/). To install it on your local machine, run the following command:

```shell
curl -sSL https://install.python-poetry.org | python3 -
```

Once the installation completes, Poetry will prompt you to add its bin directory to your `PATH` in order to enable the use of `poetry` in your command line. On Ubuntu with Bash, this can be done by opening the `~/.bashrc` file using `nano` or your preferred text editor:

```shell
nano ~/.bashrc
```

Add the following line to the end of the file, where instead of `your_username` you put your real username:

```shell
export PATH="/home/your_username/.local/bin:$PATH"
```

Save and exit the file. To apply the changes, you can either close and re-open the terminal, or you can execute the following command on your current session:

```shell
source ~/.bashrc
```

To check that the `poetry` command is now available, enter the following to display the current Poetry version:

```shell
poetry --version
```

### Virtual Environment Setup

Now that you have installed both Python 3.12 and Poetry on your local machine, it's time to setup the virtual environment. First of all, you need to move to the `api` module directory:

```shell
cd ./api/
```

You'll notice that there are two particular files in this directory:
- `pyproject.toml` orchestrates the project and manages the dependencies. If you need to modify the dependencies, you can either modify the `[tool.poetry.dependencies]` section, or use specific `poetry` commands.
- `poetry.lock` lists the exact versions of the installed dependencies, locking the project to those specific versions. You should always commit this file so that all people working on the project are locked to the same versions of dependencies.

To create the virtual environment, execute the following:

```shell
poetry install --no-root
```

Once it finishes, you should see the newly created `.venv` directory. You can activate the environment with:

```shell
source ./.venv/bin/activate
```

## MongoDB Configuration

Although it's not mandatory, it's recommended to setup [MongoDB Compass](https://www.mongodb.com/products/tools/compass) to see in real-time what is happening inside the database. This can be especially useful if you want to interact directly with the database while testing new functionalities.

To connect to the database, you must set `mongodb://devusername:devpassword@localhost:27017/` as URI connection string.

## Postman Configuration

Although it's not mandatory, it's recommended to setup [Postman](https://www.postman.com) to interact with the API. This can be especially useful if you want to test if the endpoints work correctly, without the need to use the website.

To communicate with the API, you must set `http://localhost:8080/api/` as base URL. It's highly suggested to set it as a environment variable within the program, so that you don't have to rewrite it every time.