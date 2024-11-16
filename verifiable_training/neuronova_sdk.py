import ravnest
import torch
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
        print('Tdx quote for current computation: ', tdxQuote)
        super().trigger_send(data=data, type=type)