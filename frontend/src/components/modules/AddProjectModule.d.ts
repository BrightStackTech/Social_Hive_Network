declare function AddProjectModule({ groupId, refreshFunc, type }: {
    groupId?: string;
    refreshFunc: () => void;
    type?: string;
}): import("react/jsx-runtime").JSX.Element;
export default AddProjectModule;
