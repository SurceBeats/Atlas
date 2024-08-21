import os

data_dir = os.path.join(os.getcwd(), 'logs')
if not os.path.exists(data_dir):
    os.makedirs(data_dir)

data_dir = os.path.join(os.getcwd(), 'data/galaxy')
if not os.path.exists(data_dir):
    os.makedirs(data_dir)

data_dir = os.path.join(os.getcwd(), 'data/system')
if not os.path.exists(data_dir):
    os.makedirs(data_dir)

data_dir = os.path.join(os.getcwd(), 'data/planet')
if not os.path.exists(data_dir):
    os.makedirs(data_dir)

data_dir = os.path.join(os.getcwd(), 'data/life')
if not os.path.exists(data_dir):
    os.makedirs(data_dir)
