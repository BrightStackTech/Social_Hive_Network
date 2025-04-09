declare function UpdateTaskModal({ task, closeOtherModal, refreshFunc }: {
    task: any;
    closeOtherModal?: (value: boolean) => void;
    refreshFunc: () => void;
}): import("react/jsx-runtime").JSX.Element;
export default UpdateTaskModal;
