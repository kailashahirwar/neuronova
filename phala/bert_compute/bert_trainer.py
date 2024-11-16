import ravnest
from ravnest.utils import no_schedule
import time

class BERT_Trainer(ravnest.Trainer):
    def __init__(self, node=None, train_loader=None, epochs=1):
        super().__init__(node=node, train_loader=train_loader, epochs=epochs)

    def train(self):
        self.prelim_checks()
        for epoch in range(self.epochs):
            for batch in self.train_loader:
                self.node.forward_compute(input_ids = batch['input_ids'],
                                          token_type_ids =batch['token_type_ids'], 
                                          attention_mask =batch['attention_mask'])  

            self.node.wait_for_backwards()   # To be called at end of every epoch
                
        print('BERT Training Done!')

class BERTAsync_Trainer(ravnest.trainer.BaseTrainerFullAsync):
    def __init__(self, node:ravnest.Node = None, epochs=1, 
                 batch_size=64, update_frequency = 1, loss_fn = None):
        super().__init__(node=node, epochs=epochs, batch_size=batch_size, 
                         update_frequency=update_frequency, loss_fn=loss_fn)
    
    @no_schedule()
    def train_step(self, batch):
        outputs = self.node.forward(input_ids = batch['input_ids'],
                                    token_type_ids = batch['token_type_ids'], 
                                    attention_mask = batch['attention_mask'])
        loss = self.node.dist_func(self.loss_fn, args=(outputs, batch['labels']))
        if self.node.node_type == ravnest.NodeTypes.LEAF:
            print('Loss: ', loss)
        self.node.backward(loss)

        if self.node.n_backwards % self.update_frequency == 0:
            self.node.optimizer_step()
            self.node.model.zero_grad()
            self.node.optimizer.zero_grad()

    def train(self):
        # self.prelim_checks()
        t1 = time.time()
        for epoch in range(self.epochs):
            self.node.model.train()
            t2 = time.time()
            for batch in self.train_loader:
                self.train_step(batch)
            
            self.await_backwards()
            
            if self.lr_scheduler is not None:
                self.lr_scheduler.step()
            print('Epoch: ', epoch, ' time taken: ', time.time() - t2)

        self.node.model.train()
        self.await_backwards()
        print('Training Done!: ', time.time() - t1, ' seconds')
        
        self.node.comm_session.parallel_ring_reduce()
        # print('Training Done!: ', time.time() - t1, ' seconds')

        # if self.save:
        #     self.node.trigger_save_submodel()
