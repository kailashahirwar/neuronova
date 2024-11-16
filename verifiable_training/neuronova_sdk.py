import ravnest
import torch
import time
import requests
import _pickle as cPickle
from dstack_sdk import TappdClient, AsyncTappdClient, DeriveKeyResponse, TdxQuoteResponse

class NeuroNode(ravnest.Node):
    def __init__(self, name=None, model=None, optimizer=None, optimizer_params={}, update_frequency = 1, 
                 reduce_factor=None, labels=None, device = torch.device('cpu'), 
                 loss_filename='losses.txt', compression=False, average_optim=False, **kwargs):
        super().__init__(
            name=name,
            model=model,
            optimizer=optimizer,
            optimizer_params=optimizer_params,
            update_frequency=update_frequency,
            reduce_factor=reduce_factor,
            labels=labels,
            device=device,
            loss_filename=loss_filename,
            compression=compression,
            average_optim=average_optim,
            **kwargs
        )

        self.tappd_client = TappdClient()

    def trigger_send(self, data, type=None):
        tdxQuote = requests.post('http://localhost:3000/tdxquote', data=cPickle.dumps(data))
        # tdxQuote = self.tappd_client.tdx_quote(cPickle.dumps(data))
        # print('Tdx quote for current computation: ', tdxQuote.text)
        super().trigger_send(data=data, type=type)

def push_metric_to_chain(metric_name:str, metric):
    payload = {'title':metric_name, 'description':metric}
    response = requests.post('http://65.0.94.255:300', json=payload)
    return response

class NeuroTrainer(ravnest.trainer.BaseTrainerFullAsync):
    def __init__(self, node:NeuroNode = None, lr_scheduler=None, lr_scheduler_params={}, 
                 train_loader=None, val_loader=None, val_freq=1, save=False, epochs=1, 
                 batch_size=64, step_size=1, update_frequency = 1, loss_fn = None, accuracy_fn=None):
        
        super().__init__(
            node=node,
            lr_scheduler=lr_scheduler,
            lr_scheduler_params=lr_scheduler_params,
            train_loader=train_loader,
            val_loader=val_loader,
            val_freq=val_freq,
            save=save,
            epochs=epochs,
            batch_size=batch_size,
            step_size=step_size,
            update_frequency=update_frequency,
            loss_fn=loss_fn,
            accuracy_fn=accuracy_fn
        )

    def train(self):
        # self.prelim_checks()
        response = push_metric_to_chain('Train_init', 'Training Started!')
        t1 = time.time()
        for epoch in range(self.epochs):
            self.node.model.train()
            t2 = time.time()
            for X_train, y_train in self.train_loader:
                self.train_step(X_train, y_train)
            
            self.await_backwards()

            if self.val_loader is not None: 
                # self.await_backwards()
                self.node.model.eval()
                acc = 0
                for X_test, y_test in self.val_loader:
                    # self.await_one_backward()
                    # self.node.model.eval()
                    output = self.node.no_grad_forward(X_test)
                    accuracy = self.node.dist_func(self.accuracy_fn, args=(output, y_test))
                    if self.node.node_type == ravnest.NodeTypes.LEAF:
                        acc += accuracy.numpy()
                if self.node.node_type == ravnest.NodeTypes.LEAF:
                    eval_accuracy = acc/len(self.val_loader)
                    print('Accuracy: ', eval_accuracy)
                    '''pushing validation accuracy onto chain'''
                    response = push_metric_to_chain('Val_accuracy_epoch_{}'.format(epoch), eval_accuracy)
                    print(response.status_code, response.text)
            
            if self.lr_scheduler is not None:
                self.lr_scheduler.step()
            print('Epoch: ', epoch, ' time taken: ', time.time() - t2)

        self.node.model.train()
        self.await_backwards()
        print('Training Done!: ', time.time() - t1, ' seconds')
        response = push_metric_to_chain('Train_fin', 'Training Finished, duration: {}'.format(time.time() - t1))
        
        self.node.comm_session.parallel_ring_reduce()
        # print('Training Done!: ', time.time() - t1, ' seconds')

        if self.save:
            self.node.trigger_save_submodel()