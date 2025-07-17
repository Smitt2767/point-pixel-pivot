import ImageDimensionsPicker from "../components/ImageDimensionsPicker";

const Index = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <ImageDimensionsPicker 
        imageUrl="/lovable-uploads/117e3d83-664d-4f6a-a4a3-af81e917db59.png"
        containerDimensions={{ width: 800, height: 400 }}
        mobileWidth={200}
        tabletWidth={400}
      />
    </div>
  );
};

export default Index;
