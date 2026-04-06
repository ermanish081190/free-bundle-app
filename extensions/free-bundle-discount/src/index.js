// @ts-nocheck

function coreLogic(input) {
  const discounts = [];
  const bundles = input?.shop?.metafield?.jsonValue || [];

  if (!Array.isArray(bundles) || bundles.length === 0) {
    return { operations: [] };
  }

  for (const bundle of bundles) {
    const triggerVariantId = bundle.triggerProductVariantId;
    const buyQty = Number(bundle.buyQty || 1);
    const freeVariants = bundle.freeProductVariants || [];

    if (!triggerVariantId || !freeVariants.length) continue;

    // 🔹 Count trigger quantity
    let triggerQty = 0;

    for (const line of input.cart.lines) {
      if (line?.merchandise?.id === triggerVariantId) {
        triggerQty += line.quantity || 0;
      }
    }

    if (triggerQty < buyQty) continue;

    // 🔥 Handle same variant case
    const sameVariantFree = freeVariants.find(
      f => f.productVariantId === triggerVariantId
    );

    let multiplier;

    if (sameVariantFree) {
      const bundleSize = buyQty + sameVariantFree.qty;
      multiplier = Math.floor(triggerQty / bundleSize);
    } else {
      multiplier = Math.floor(triggerQty / buyQty);
    }

    if (multiplier <= 0) continue;

    // ✅ COLLECT ALL TARGETS HERE
    const targets = [];

    for (const free of freeVariants) {
      const targetVariantId = free.productVariantId;
      let remainingQty = free.qty * multiplier;

      if (!targetVariantId || remainingQty <= 0) continue;

      for (const line of input.cart.lines) {
        const variantId = line?.merchandise?.id;
        const lineId = line.id;
        const qty = line.quantity || 0;

        if (!variantId || !lineId) continue;

        if (variantId === targetVariantId && remainingQty > 0) {
          const applyQty = Math.min(qty, remainingQty);

          // ✅ ADD TO SAME TARGET ARRAY
          targets.push({
            cartLine: {
              id: lineId,
              quantity: applyQty,
            },
          });

          remainingQty -= applyQty;
        }
      }
    }

    // ✅ PUSH ONLY ONE CANDIDATE PER BUNDLE
    if (targets.length > 0) {
      discounts.push({
        message: "FREEBUNDLE",
        targets,
        value: {
          percentage: { value: 100 },
        },
      });
    }
  }

  if (!discounts.length) {
    return { operations: [] };
  }

  return {
    operations: [
      {
        productDiscountsAdd: {
          selectionStrategy: "FIRST",
          candidates: discounts,
        },
      },
    ],
  };
}

// ✅ REQUIRED EXPORTS
export function cartLinesDiscountsGenerateRun(input) {
  return coreLogic(input);
}

export function cartDeliveryOptionsDiscountsGenerateRun(input) {
  return { operations: [] };
}