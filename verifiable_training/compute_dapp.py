from neuronova_sdk import NeuroNode, NeuroTrainer

import os
from torch.utils.data import DataLoader
import torch
from ravnest import clusterize, set_seed
from fastapi import FastAPI
import numpy as np
from models import CNN_Net
from sklearn import datasets
from sklearn.model_selection import train_test_split

compute_dapp = FastAPI()

set_seed(42)

def to_categorical(x, n_col=None):
    if not n_col:
        n_col = np.amax(x) + 1
    one_hot = np.zeros((x.shape[0], n_col))
    one_hot[np.arange(x.shape[0]), x] = 1
    return one_hot

def preprocess_dataset():
    data = datasets.load_digits()
    X = data.data
    y = data.target

    # Convert to one-hot encoding
    y = to_categorical(y.astype("int"))

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.4, random_state=1)

    # Reshape X to (n_samples, channels, height, width)
    X_train = X_train.reshape((-1, 1, 8, 8)).astype(np.float32)
    X_test = X_test.reshape((-1, 1, 8, 8)).astype(np.float32)

    generator = torch.Generator()
    generator.manual_seed(42)

    train_loader = DataLoader(list(zip(X_train,torch.tensor(y_train, dtype=torch.float32))), generator=generator, shuffle=True, batch_size=64)
    val_loader = DataLoader(list(zip(X_test,torch.tensor(y_test, dtype=torch.float32))), shuffle=False, batch_size=64)

    return train_loader, val_loader

def loss_fn(preds, targets):
    return torch.nn.functional.mse_loss(preds, targets)

def accuracy_fn(preds, y_test):
    _, y_pred_tags = torch.max(preds, dim=1)
    #for cnn
    y_test = torch.argmax(y_test, dim=1)

    correct_pred = (y_pred_tags == y_test).float()
    val_acc = correct_pred.sum() / len(y_test)
    val_acc = torch.round(val_acc * 100)
    return val_acc


def start_node():
    train_loader, val_loader = preprocess_dataset()

    neuronode = NeuroNode(name = 'node_0', 
                optimizer = torch.optim.Adam,
                device=torch.device('cpu'),
                criterion = loss_fn,
                labels = train_loader,
                test_labels=val_loader,
                # reduce_factor=4,
                average_optim=True
    )

    trainer = NeuroTrainer(node=neuronode,
                      train_loader=train_loader,
                      val_loader=val_loader,
                      val_freq=64,
                      epochs=20,
                      batch_size=64,
                    #   save=True,
                      loss_fn=loss_fn,
                      accuracy_fn=accuracy_fn
                    )

    trainer.train()


@compute_dapp.get("/")
async def root():
    model = CNN_Net()
    example_args = torch.rand((64,1,8,8))
    clusterize(model=model, example_args=(example_args,))
    start_node()
    return {"message": "The World! Call /derivekey or /tdxquote"}