import {
  assert,
  test,
  React,
  renderToStaticMarkup,
  publicSubpaths,
  namespaceNameForSubpath,
} from "./test-utils.mjs";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AppBar,
  AppBarCenter,
  AppBarEnd,
  AppBarRoot,
  AppBarStart,
  AppBarToolbar,
  AspectRatio,
  AspectRatioRoot,
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxRoot,
  getNextCollectionItem,
  sortCollectionItemsByDocumentOrder,
  ContextMenu,
  Dialog,
  DataGrid,
  DataGridBody,
  DataGridCaption,
  DataGridCell,
  DataGridColumnHeader,
  DataGridFooter,
  DataGridHeader,
  DataGridRoot,
  DataGridRow,
  Direction,
  DirectionProvider,
  DropdownMenu,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRequiredIndicator,
  FieldRoot,
  Fieldset,
  FieldsetDescription,
  FieldsetError,
  FieldsetLegend,
  FieldsetRoot,
  Feed,
  FeedItem,
  FeedRoot,
  FileUpload,
  FileUploadDropzone,
  FileUploadHiddenInput,
  FileUploadItem,
  FileUploadItemDeleteTrigger,
  FileUploadItemGroup,
  FileUploadItemName,
  FileUploadItemSize,
  FileUploadRoot,
  FileUploadTrigger,
  Form,
  FormRoot,
  HoverCard,
  Input,
  InputClear,
  InputRoot,
  Label,
  LabelRoot,
  List,
  ListItem,
  ListRoot,
  Listbox,
  ListboxGroup,
  ListboxLabel,
  ListboxOption,
  ListboxOptionText,
  ListboxRoot,
  Menu,
  Menubar,
  Modal,
  NavList,
  NavListItem,
  NavListLink,
  NavListList,
  NavListRoot,
  NavListSection,
  NavListSectionContent,
  NavListSectionLabel,
  NavListSectionTrigger,
  Popover,
  Select,
  Tabs,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
  Textarea,
  TextareaCount,
  TextareaRoot,
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemText,
  TreeRoot,
  TreeGrid,
  TreeGridBody,
  TreeGridCaption,
  TreeGridCell,
  TreeGridColumnHeader,
  TreeGridHeader,
  TreeGridRoot,
  TreeGridRow,
  TreeGridRowHeader,
  Tooltip,
  Toolbar,
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbRoot,
  BreadcrumbSeparator,
  Button,
  ButtonRoot,
  Checkbox,
  CheckboxGroup,
  CheckboxGroupItem,
  CheckboxIndicator,
  CheckboxRoot,
  CheckboxGroupRoot,
  Drawer,
  MenuContent,
  MenuSubContent,
  MenubarContent,
  ModalClose,
  ModalRoot,
  NavigationMenuIndicator,
  NavigationMenuRoot,
  NavigationMenuSub,
  OTPField,
  OTPFieldInput,
  OTPFieldRoot,
  OTPFieldSeparator,
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
  PasswordToggleField,
  PasswordToggleFieldIcon,
  PasswordToggleFieldInput,
  PasswordToggleFieldRoot,
  PasswordToggleFieldToggle,
  Portal,
  Pressable,
  PressableRoot,
  Progress,
  ProgressIndicator,
  ProgressRoot,
  Rating,
  RatingItem,
  RatingRoot,
  getRatingItemState,
  ScrollArea,
  ScrollAreaRoot,
  ScrollAreaViewport,
  SkipLink,
  SkipLinkRoot,
  SkipLinkTarget,
  SelectArrow,
  SelectScrollDownButton,
  SelectScrollUpButton,
  Sidebar,
  SidebarMain,
  SidebarPanel,
  SidebarRoot,
  SidebarTrigger,
  Switch,
  SwitchRoot,
  SwitchThumb,
  SwipeableItem,
  SwipeableItemActions,
  SwipeableItemContent,
  SwipeableItemRoot,
  getSwipeableItemOffsetForSide,
  Toast,
  ToastAction,
  ToastProvider,
  ToastRoot,
  ToastViewport,
  VisuallyHidden,
  VisuallyHiddenRoot,
  useControllableState,
  useDirection,
  filterComboboxOptions,
  fileMatchesAccept,
  getPaginationRange,
  getProgressState,
  formatFileSize,
  filterOTPFieldValue,
  isOTPFieldCharAccepted,
  getVirtualItems,
  getVirtualTotalSize,
  getNavigationMenuGeometry,
  toast,
  validateFileUploadFiles,
  useVirtualizer,
} from "../dist/index.js";

test("package subpath exports can be imported through package self-reference", async () => {
  const rootModule = await import("@flowstack-ui/atom");
  assert.ok(rootModule.Switch.Root);
  assert.ok(rootModule.Switch.Thumb);

  for (const subpath of publicSubpaths) {
    const mod = await import(`@flowstack-ui/atom/${subpath}`);

    if (subpath === "hooks") {
      assert.equal(typeof mod.useControllableState, "function");
      assert.equal(typeof mod.usePresence, "function");
      assert.equal(typeof mod.useScrollSpy, "function");
      assert.equal(typeof mod.useVirtualizer, "function");
      continue;
    }

    if (subpath === "portal") {
      assert.equal(mod.Portal, Portal);
      continue;
    }

    if (subpath === "collection") {
      assert.equal(typeof mod.useCollection, "function");
      assert.equal(typeof mod.getNextCollectionItem, "function");
      assert.equal(typeof mod.sortCollectionItemsByDocumentOrder, "function");
      continue;
    }

    if (subpath === "app-bar") {
      assert.equal(mod.AppBar.Root, mod.AppBarRoot);
      assert.equal(mod.AppBar.Toolbar, mod.AppBarToolbar);
      assert.equal(mod.AppBar.Start, mod.AppBarStart);
      assert.equal(mod.AppBar.Center, mod.AppBarCenter);
      assert.equal(mod.AppBar.End, mod.AppBarEnd);
      continue;
    }

    if (subpath === "data-grid") {
      assert.equal(mod.DataGrid.Root, mod.DataGridRoot);
      assert.equal(mod.DataGrid.Header, mod.DataGridHeader);
      assert.equal(mod.DataGrid.Body, mod.DataGridBody);
      assert.equal(mod.DataGrid.Footer, mod.DataGridFooter);
      assert.equal(mod.DataGrid.Row, mod.DataGridRow);
      assert.equal(mod.DataGrid.ColumnHeader, mod.DataGridColumnHeader);
      assert.equal(mod.DataGrid.Cell, mod.DataGridCell);
      assert.equal(mod.DataGrid.Caption, mod.DataGridCaption);
      assert.equal(mod.getDataGridCellValue, undefined);
    }

    if (subpath === "virtualizer") {
      assert.equal(typeof mod.useVirtualizer, "function");
      assert.equal(typeof mod.getVirtualItems, "function");
      assert.equal(typeof mod.getVirtualTotalSize, "function");
      continue;
    }

    if (subpath === "switch") {
      assert.equal(mod.Switch.Root, mod.SwitchRoot);
      assert.equal(mod.Switch.Thumb, mod.SwitchThumb);
    }

    if (subpath === "checkbox") {
      assert.equal(mod.Checkbox.Root, mod.CheckboxRoot);
      assert.equal(mod.Checkbox.Indicator, mod.CheckboxIndicator);
    }

    if (subpath === "checkbox-group") {
      assert.equal(mod.CheckboxGroup.Root, mod.CheckboxGroupRoot);
      assert.equal(mod.CheckboxGroup.Item, mod.CheckboxGroupItem);
    }

    if (subpath === "alert-dialog") {
      assert.equal(mod.AlertDialog.Root, mod.AlertDialogRoot);
      assert.equal(mod.AlertDialog.Portal, mod.AlertDialogPortal);
      assert.equal(mod.AlertDialog.Overlay, mod.AlertDialogOverlay);
      assert.equal(mod.AlertDialog.Content, mod.AlertDialogContent);
      assert.equal(mod.AlertDialog.Cancel, mod.AlertDialogCancel);
      assert.equal(mod.AlertDialog.Action, mod.AlertDialogAction);
    }

    if (subpath === "aspect-ratio") {
      assert.equal(mod.AspectRatio.Root, mod.AspectRatioRoot);
    }

    if (subpath === "combobox") {
      assert.equal(mod.Combobox.Root, mod.ComboboxRoot);
      assert.equal(mod.Combobox.Input, mod.ComboboxInput);
      assert.equal(mod.Combobox.Content, mod.ComboboxContent);
      assert.equal(mod.Combobox.Item, mod.ComboboxItem);
      assert.equal(typeof mod.filterComboboxOptions, "function");
    }

    if (subpath === "pagination") {
      assert.equal(mod.Pagination.Root, mod.PaginationRoot);
      assert.equal(mod.Pagination.List, mod.PaginationList);
      assert.equal(mod.Pagination.Previous, mod.PaginationPrevious);
      assert.equal(mod.Pagination.Item, mod.PaginationItem);
      assert.equal(mod.Pagination.Ellipsis, mod.PaginationEllipsis);
      assert.equal(mod.Pagination.Next, mod.PaginationNext);
      assert.equal(typeof mod.getPaginationRange, "function");
    }

    if (subpath === "breadcrumb") {
      assert.equal(mod.Breadcrumb.Root, mod.BreadcrumbRoot);
      assert.equal(mod.Breadcrumb.List, mod.BreadcrumbList);
      assert.equal(mod.Breadcrumb.Item, mod.BreadcrumbItem);
      assert.equal(mod.Breadcrumb.Link, mod.BreadcrumbLink);
      assert.equal(mod.Breadcrumb.Page, mod.BreadcrumbPage);
      assert.equal(mod.Breadcrumb.Separator, mod.BreadcrumbSeparator);
      assert.equal(mod.Breadcrumb.Ellipsis, mod.BreadcrumbEllipsis);
    }

    if (subpath === "direction") {
      assert.equal(mod.Direction.Provider, mod.DirectionProvider);
      assert.equal(typeof mod.useDirection, "function");
    }

    if (subpath === "label") {
      assert.equal(mod.Label.Root, mod.LabelRoot);
    }

    if (subpath === "list") {
      assert.equal(mod.List.Root, mod.ListRoot);
      assert.equal(mod.List.Item, mod.ListItem);
    }

    if (subpath === "nav-list") {
      assert.equal(mod.NavList.Root, mod.NavListRoot);
      assert.equal(mod.NavList.List, mod.NavListList);
      assert.equal(mod.NavList.Item, mod.NavListItem);
      assert.equal(mod.NavList.Link, mod.NavListLink);
      assert.equal(mod.NavList.Section, mod.NavListSection);
      assert.equal(mod.NavList.SectionLabel, mod.NavListSectionLabel);
      assert.equal(mod.NavList.SectionTrigger, mod.NavListSectionTrigger);
      assert.equal(mod.NavList.SectionContent, mod.NavListSectionContent);
    }

    if (subpath === "listbox") {
      assert.equal(mod.Listbox.Root, mod.ListboxRoot);
      assert.equal(mod.Listbox.Option, mod.ListboxOption);
      assert.equal(mod.Listbox.OptionText, mod.ListboxOptionText);
      assert.equal(mod.Listbox.Group, mod.ListboxGroup);
      assert.equal(mod.Listbox.Label, mod.ListboxLabel);
    }

    if (subpath === "tree") {
      assert.equal(mod.Tree.Root, mod.TreeRoot);
      assert.equal(mod.Tree.Item, mod.TreeItem);
      assert.equal(mod.Tree.ItemText, mod.TreeItemText);
      assert.equal(mod.Tree.Group, mod.TreeGroup);
    }

    if (subpath === "tree-grid") {
      assert.equal(mod.TreeGrid.Root, mod.TreeGridRoot);
      assert.equal(mod.TreeGrid.Header, mod.TreeGridHeader);
      assert.equal(mod.TreeGrid.Body, mod.TreeGridBody);
      assert.equal(mod.TreeGrid.Row, mod.TreeGridRow);
      assert.equal(mod.TreeGrid.ColumnHeader, mod.TreeGridColumnHeader);
      assert.equal(mod.TreeGrid.RowHeader, mod.TreeGridRowHeader);
      assert.equal(mod.TreeGrid.Cell, mod.TreeGridCell);
      assert.equal(mod.TreeGrid.Caption, mod.TreeGridCaption);
      assert.equal(mod.getTreeGridCellValue, undefined);
    }

    if (subpath === "field") {
      assert.equal(mod.Field.Root, mod.FieldRoot);
      assert.equal(mod.Field.Label, mod.FieldLabel);
      assert.equal(mod.Field.Description, mod.FieldDescription);
      assert.equal(mod.Field.Error, mod.FieldError);
      assert.equal(mod.Field.RequiredIndicator, mod.FieldRequiredIndicator);
    }

    if (subpath === "input") {
      assert.equal(mod.Input.Root, mod.InputRoot);
      assert.equal(mod.Input.Clear, mod.InputClear);
    }

    if (subpath === "button") {
      assert.equal(mod.Button.Root, mod.ButtonRoot);
    }

    if (subpath === "fieldset") {
      assert.equal(mod.Fieldset.Root, mod.FieldsetRoot);
      assert.equal(mod.Fieldset.Legend, mod.FieldsetLegend);
      assert.equal(mod.Fieldset.Description, mod.FieldsetDescription);
      assert.equal(mod.Fieldset.Error, mod.FieldsetError);
    }

    if (subpath === "feed") {
      assert.equal(mod.Feed.Root, mod.FeedRoot);
      assert.equal(mod.Feed.Item, mod.FeedItem);
    }

    if (subpath === "file-upload") {
      assert.equal(mod.FileUpload.Root, mod.FileUploadRoot);
      assert.equal(mod.FileUpload.HiddenInput, mod.FileUploadHiddenInput);
      assert.equal(mod.FileUpload.Trigger, mod.FileUploadTrigger);
      assert.equal(mod.FileUpload.Dropzone, mod.FileUploadDropzone);
      assert.equal(mod.FileUpload.ItemGroup, mod.FileUploadItemGroup);
      assert.equal(mod.FileUpload.Item, mod.FileUploadItem);
      assert.equal(mod.FileUpload.ItemName, mod.FileUploadItemName);
      assert.equal(mod.FileUpload.ItemSize, mod.FileUploadItemSize);
      assert.equal(mod.FileUpload.ItemDeleteTrigger, mod.FileUploadItemDeleteTrigger);
      assert.equal(typeof mod.fileMatchesAccept, "function");
      assert.equal(typeof mod.validateFileUploadFiles, "function");
      assert.equal(typeof mod.formatFileSize, "function");
    }

    if (subpath === "form") {
      assert.equal(mod.Form.Root, mod.FormRoot);
      assert.equal(typeof mod.useFormContext, "function");
    }

    if (subpath === "navigation-menu") {
      assert.equal(mod.NavigationMenu.Root, mod.NavigationMenuRoot);
      assert.equal(mod.NavigationMenu.Sub, mod.NavigationMenuSub);
      assert.equal(mod.NavigationMenu.Indicator, mod.NavigationMenuIndicator);
      assert.equal(typeof mod.getNavigationMenuGeometry, "function");
    }

    if (subpath === "progress") {
      assert.equal(mod.Progress.Root, mod.ProgressRoot);
      assert.equal(mod.Progress.Indicator, mod.ProgressIndicator);
      assert.equal(typeof mod.getProgressState, "function");
    }

    if (subpath === "rating") {
      assert.equal(mod.Rating.Root, mod.RatingRoot);
      assert.equal(mod.Rating.Item, mod.RatingItem);
      assert.equal(typeof mod.getRatingItemState, "function");
    }

    if (subpath === "pressable") {
      assert.equal(mod.Pressable.Root, mod.PressableRoot);
    }

    if (subpath === "scroll-area") {
      assert.equal(mod.ScrollArea.Root, mod.ScrollAreaRoot);
      assert.equal(mod.ScrollArea.Viewport, mod.ScrollAreaViewport);
    }

    if (subpath === "swipeable-item") {
      assert.equal(mod.SwipeableItem.Root, mod.SwipeableItemRoot);
      assert.equal(mod.SwipeableItem.Content, mod.SwipeableItemContent);
      assert.equal(mod.SwipeableItem.Actions, mod.SwipeableItemActions);
      assert.equal(typeof mod.getSwipeableItemOffsetForSide, "function");
    }

    if (subpath === "table") {
      assert.equal(mod.Table.Root, mod.TableRoot);
      assert.equal(mod.Table.Header, mod.TableHeader);
      assert.equal(mod.Table.Body, mod.TableBody);
      assert.equal(mod.Table.Footer, mod.TableFooter);
      assert.equal(mod.Table.Row, mod.TableRow);
      assert.equal(mod.Table.Head, mod.TableHead);
      assert.equal(mod.Table.Cell, mod.TableCell);
      assert.equal(mod.Table.Caption, mod.TableCaption);
    }

    if (subpath === "skip-link") {
      assert.equal(mod.SkipLink.Root, mod.SkipLinkRoot);
      assert.equal(mod.SkipLink.Target, mod.SkipLinkTarget);
    }

    if (subpath === "toast") {
      assert.equal(mod.Toast.Provider, mod.ToastProvider);
      assert.equal(mod.Toast.Root, mod.ToastRoot);
      assert.equal(mod.Toast.Viewport, mod.ToastViewport);
      assert.equal(mod.Toast.Action, mod.ToastAction);
      assert.equal(typeof mod.toast.success, "function");
    }

    if (subpath === "otp-field") {
      assert.equal(mod.OTPField.Root, mod.OTPFieldRoot);
      assert.equal(mod.OTPField.Input, mod.OTPFieldInput);
      assert.equal(mod.OTPField.Separator, mod.OTPFieldSeparator);
      assert.equal(typeof mod.filterOTPFieldValue, "function");
      assert.equal(typeof mod.isOTPFieldCharAccepted, "function");
    }

    if (subpath === "password-toggle-field") {
      assert.equal(mod.PasswordToggleField.Root, mod.PasswordToggleFieldRoot);
      assert.equal(mod.PasswordToggleField.Input, mod.PasswordToggleFieldInput);
      assert.equal(mod.PasswordToggleField.Toggle, mod.PasswordToggleFieldToggle);
      assert.equal(mod.PasswordToggleField.Icon, mod.PasswordToggleFieldIcon);
    }

    if (subpath === "textarea") {
      assert.equal(mod.Textarea.Root, mod.TextareaRoot);
      assert.equal(mod.Textarea.Count, mod.TextareaCount);
    }

    if (subpath === "sidebar") {
      assert.equal(mod.Sidebar.Root, mod.SidebarRoot);
      assert.equal(mod.Sidebar.Trigger, mod.SidebarTrigger);
      assert.equal(mod.Sidebar.Panel, mod.SidebarPanel);
      assert.equal(mod.Sidebar.Main, mod.SidebarMain);
    }

    if (subpath === "visually-hidden") {
      assert.equal(mod.VisuallyHidden.Root, mod.VisuallyHiddenRoot);
      assert.equal(typeof mod.visuallyHiddenStyle, "object");
    }

    const namespaceName = namespaceNameForSubpath(subpath);
    assert.equal(typeof mod[namespaceName], "object", `${subpath} namespace export is missing`);
    assert.ok(mod[namespaceName].Root ?? mod[namespaceName].Provider);
  }
});

test("namespace exports provide the long-term compound API", () => {
  const dialogHtml = renderToStaticMarkup(
    React.createElement(
      Dialog.Root,
      { defaultOpen: true },
      React.createElement(Dialog.Trigger, null, "Open"),
      React.createElement(Dialog.Title, null, "Settings"),
      React.createElement(Dialog.Description, null, "Change preferences"),
      React.createElement(
        Dialog.Close,
        { asChild: true },
        React.createElement("button", { type: "button" }, "Close"),
      ),
    ),
  );

  assert.equal(typeof Dialog.Content, "object");
  assert.equal(typeof Dialog.Portal, "function");
  assert.equal(typeof Dialog.Overlay, "object");
  assert.match(dialogHtml, /data-slot="dialog-trigger"/);
  assert.match(dialogHtml, /data-slot="dialog-title"/);
  assert.match(dialogHtml, /data-slot="dialog-description"/);
  assert.match(dialogHtml, /data-slot="dialog-close"/);
  assert.equal(typeof Modal.Portal, "function");

  const modalCloseHtml = renderToStaticMarkup(
    React.createElement(
      ModalRoot,
      { defaultOpen: true },
      React.createElement(ModalClose, null, "Close"),
    ),
  );

  assert.match(modalCloseHtml, /<button/);
  assert.match(modalCloseHtml, /type="button"/);
  assert.match(modalCloseHtml, /data-slot="modal-close"/);

  const drawerHtml = renderToStaticMarkup(
    React.createElement(
      Drawer.Root,
      { defaultOpen: true },
      React.createElement(Drawer.Trigger, null, "Open"),
      React.createElement(Drawer.Content, { placement: "right", ariaLabel: "Menu" }, "Panel"),
    ),
  );

  assert.equal(typeof Drawer.Portal, "function");
  assert.equal(typeof Drawer.Overlay, "object");
  assert.equal(typeof Drawer.Content, "object");
  assert.match(drawerHtml, /data-slot="drawer-trigger"/);
  assert.match(drawerHtml, /data-slot="drawer-content"/);
  assert.match(drawerHtml, /data-placement="right"/);

  assert.equal(typeof MenuContent, "object");
  assert.equal(typeof MenuSubContent, "object");
  assert.equal(typeof MenubarContent, "object");
  assert.equal(typeof ContextMenu.Content, "object");
  assert.equal(typeof ContextMenu.Item, "object");
  assert.equal(typeof ContextMenu.CheckboxItem, "function");
  assert.equal(typeof ContextMenu.RadioGroup, "function");
  assert.equal(typeof ContextMenu.RadioItem, "function");
  assert.equal(typeof ContextMenu.SubContent, "object");
  assert.equal(typeof DropdownMenu.Content, "object");
  assert.equal(typeof DropdownMenu.SubContent, "object");
  assert.equal(typeof Menu.Content, "object");
  assert.equal(typeof Menu.SubContent, "object");
  assert.equal(typeof Menubar.Content, "object");
  assert.equal(typeof Menubar.Item, "object");
  assert.equal(typeof Menubar.CheckboxItem, "function");
  assert.equal(typeof Menubar.RadioGroup, "function");
  assert.equal(typeof Menubar.RadioItem, "function");
  assert.equal(typeof Menubar.SubContent, "object");
  assert.equal(typeof Popover.Content, "object");
  assert.equal(typeof Popover.Portal, "function");
  assert.equal(typeof Popover.Arrow, "object");
  assert.equal(typeof Tooltip.Content, "object");
  assert.equal(typeof Tooltip.Portal, "function");
  assert.equal(typeof Tooltip.Arrow, "object");
  assert.equal(typeof HoverCard.Content, "object");
  assert.equal(typeof HoverCard.Portal, "function");
  assert.equal(typeof HoverCard.Arrow, "object");
  assert.equal(typeof Select.Listbox, "object");
  assert.equal(typeof Select.Content, "object");
  assert.equal(typeof Select.Value, "object");
  assert.equal(typeof Select.Icon, "object");
  assert.equal(typeof Select.ItemText, "object");
  assert.equal(typeof Select.ItemIndicator, "object");
  assert.equal(typeof Select.Group, "object");
  assert.equal(typeof Select.Label, "object");
  assert.equal(typeof Select.Separator, "object");
  assert.equal(typeof Select.Portal, "function");
  assert.equal(typeof Select.ScrollUpButton, "object");
  assert.equal(typeof Select.ScrollDownButton, "object");
  assert.equal(typeof Select.Arrow, "object");
  assert.equal(typeof SelectArrow, "object");
  assert.equal(typeof SelectScrollUpButton, "object");
  assert.equal(typeof SelectScrollDownButton, "object");
  assert.equal(typeof Sidebar.Root, "object");
  assert.equal(typeof Sidebar.Trigger, "object");
  assert.equal(typeof Sidebar.Panel, "object");
  assert.equal(typeof Sidebar.Main, "object");

  const selectHtml = renderToStaticMarkup(
    React.createElement(
      Select.Root,
      { defaultValue: "pro", defaultOpen: true },
      React.createElement(Select.Trigger, { ariaLabel: "Plan" }, "Plan"),
      React.createElement(Select.Item, { value: "pro" }, "Pro"),
    ),
  );

  assert.match(selectHtml, /data-slot="select-trigger"/);
  assert.match(selectHtml, /role="combobox"/);
  assert.match(selectHtml, /data-slot="select-item"/);
  assert.match(selectHtml, /role="option"/);

  const tabsHtml = renderToStaticMarkup(
    React.createElement(
      Tabs.Root,
      { defaultValue: "overview" },
      React.createElement(
        Tabs.List,
        null,
        React.createElement(Tabs.Trigger, { value: "overview" }, "Overview"),
      ),
      React.createElement(Tabs.Content, { value: "overview" }, "Panel"),
    ),
  );

  assert.match(tabsHtml, /role="tablist"/);
  assert.match(tabsHtml, /role="tab"/);
  assert.match(tabsHtml, /role="tabpanel"/);

  const toolbarHtml = renderToStaticMarkup(
    React.createElement(
      Toolbar.Root,
      { ariaLabel: "Editor" },
      React.createElement(Toolbar.Button, { ariaLabel: "Bold" }, "B"),
      React.createElement(Toolbar.Separator, null),
    ),
  );

  assert.match(toolbarHtml, /role="toolbar"/);
  assert.match(toolbarHtml, /data-slot="toolbar-button"/);
  assert.match(toolbarHtml, /data-slot="toolbar-separator"/);

  const skipLinkHtml = renderToStaticMarkup(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(SkipLink.Root, null),
      React.createElement(SkipLink.Target, null, "Main"),
    ),
  );

  assert.match(skipLinkHtml, /data-slot="skip-link"/);
  assert.match(skipLinkHtml, /data-slot="skip-link-target"/);
});
