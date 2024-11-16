import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { pinToIPFS, pushNotification } from "@/utils/utils";

type UserType = "train" | "model" | "data" | null;

const Aibuilder = () => {
  const [userType, setUserType] = useState<UserType>(null);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  const [file, setFile] = useState<any>("");
  const [response, setResponse] = useState<any>({ data: "", loading: false });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFile(file);

    // Simulated file upload - in real implementation, this would use Web3.Storage
  };

  const handleTrainSubmit = () => {
    if (selectedModel && selectedDataset) {
      setShowConfirmation(true);
    }
  };

  const handleSubmit = async () => {
    if (file && !response?.loading) {
      setResponse({ data: "", loading: true });
      const formdata = new FormData();
      formdata.append("file", file);
      const result = await pinToIPFS(formdata);
      console.log(result.data);

      await pushNotification({
        title: "File Uploaded",
        body: `Hash: ${result.data?.IpfsHash}`,
      });

      toast({
        title: "File uploaded successfully!",
        description: `Hash: ${result.data?.IpfsHash}`,
      });
      setResponse({ data: result.data?.IpfsHash, loading: false });
      setFile("");
    }
  };

  const handleConfirm = async () => {
    if (!response?.loading) {
      toast({
        title: "Training Started",
        description: "Your model training has been initiated successfully.",
      });
      setShowConfirmation(false);
    }
  };

  useEffect(() => {
    setResponse({ response: "", loading: false });
  }, [userType]);

  return (
    <div className='min-h-screen bg-surface-soft'>
      {/* Header */}
      <div className='w-full px-6 py-4 border-b bg-surface border-border/50'>
        <div className='flex items-center justify-between mx-auto max-w-7xl'>
          <h1 className='text-2xl font-bold'>AI Training Platform</h1>
          <Button variant='outline'>For AI Builders</Button>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-3xl px-4 py-12 mx-auto space-y-8'>
        {/* Step 1: Selection */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>What are you looking for?</h2>
          <RadioGroup
            onValueChange={(value) => setUserType(value as UserType)}
            className='grid grid-cols-1 gap-4 md:grid-cols-3'
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='train' id='train' />
              <Label htmlFor='train'>Train Model</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='model' id='model' />
              <Label htmlFor='model'>Model Owner</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='data' id='data' />
              <Label htmlFor='data'>Data Owner</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Step 2: Conditional Content */}
        {userType === "train" && (
          <div className='space-y-6 animate-fade-in'>
            <div className='space-y-4'>
              <Label>Select Model for Training</Label>
              <Select onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder='Choose a model' />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value='gpt4'>GPT-4 by OpenAI</SelectItem>
                  <SelectItem value='vision'>VisionNet by ABC Corp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-4'>
              <Label>Select Data for Training</Label>
              <Select onValueChange={setSelectedDataset}>
                <SelectTrigger>
                  <SelectValue placeholder='Choose a dataset' />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value='digits'>Digits Dataset</SelectItem>
                  <SelectItem value='imagenet'>ImageNet</SelectItem>
                  <SelectItem value='custom'>Custom Dataset</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleTrainSubmit} className='w-full text-white'>
              Submit
            </Button>
          </div>
        )}

        {(userType === "model" || userType === "data") && (
          <div className='space-y-6 animate-fade-in'>
            <div className='space-y-4'>
              <Label>
                Upload Your {userType === "model" ? "Model" : "Data"} File
              </Label>
              <Input
                type='file'
                value={file ? undefined : ""}
                onChange={handleFileUpload}
              />
            </div>
            <Button onClick={handleSubmit} className='w-full text-white'>
              {response?.loading ? "Loading..." : "Submit"}
            </Button>
            {response?.data ? (
              <p className='text-sm font-medium'>Hash - {response?.data}</p>
            ) : null}
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Training Configuration</DialogTitle>
            </DialogHeader>
            <div className='py-4'>
              <p>Selected Model: {selectedModel}</p>
              <p>Selected Dataset: {selectedDataset}</p>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>
              <Button className='text-white' onClick={handleConfirm}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Aibuilder;
