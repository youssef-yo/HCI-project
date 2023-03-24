import json
import os
import shutil
from pathlib import Path
from typing import Dict, List, Union


def copy(source: Union[str, Path], destination: Union[str, Path]) -> None:
    shutil.copy(str(source), str(destination))


def create_folder(path: str):
    if os.path.exists(path):
        return

    os.umask(0)
    os.mkdir(path, 0o777)


def create_json_file(dir_path: str, name: str, content: Union[Dict, List[Dict]]):
    abspath_dir = os.path.abspath(dir_path)
    file_location = os.path.join(abspath_dir, f"{name}")

    if os.path.exists(file_location):
        return

    with open(file_location, "w+") as f:
        json.dump(content, f)
