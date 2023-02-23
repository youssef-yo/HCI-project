import shutil
from pathlib import Path
from typing import Union


def copy(source: Union[str, Path], destination: Union[str, Path]) -> None:
    shutil.copy(str(source), str(destination))
