// TanStack Table uses interior mutability: it modifies config objects in place
// while keeping the same reference. React Compiler assumes immutable props and
// memoizes based on reference equality, so these mutations go undetected.
// Excluding table components forces React to re-render them normally.
export const reactCompilerOptions = {
  // Babel passes absolute paths, so this substring matches regardless of where this file lives.
  sources: filename => !filename.includes('packages/ui/src/components/table/')
}
